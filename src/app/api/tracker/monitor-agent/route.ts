import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { NextResponse } from "next/server";

import { GEMINI_FLASH_MODEL } from "@/lib/plan-access";
import { packJobNotes } from "@/lib/tracker-utils";
import { pickDemoMatch } from "@/lib/tracker-monitor-catalog";
import { sanitizeGeneratedLatex } from "@/lib/sanitize-latex";
import { createClient } from "@/lib/supabase/server";
import { getTemplateLatex } from "@/lib/templates";
import { createEmptyResumeContent } from "@/lib/resume-content";
import type { MonitorAgentMatch, MonitorAgentScanResult } from "@/types/tracker-monitor";

type MonitorAgentBody = {
  companies?: string[];
  jobTitles?: string[];
  sourceResumeId?: string | null;
  tick?: number;
};

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Monitor agent failed";
}

async function analyzeJobDescription(jd: string): Promise<MonitorAgentMatch["jdAnalysis"]> {
  const fallback = {
    keySkills: ["Communication", "Problem solving", "Collaboration"],
    requiredExperience: "3+ years relevant experience",
    jobLevel: "Mid",
  };

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return fallback;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: GEMINI_FLASH_MODEL,
      safetySettings: SAFETY_SETTINGS,
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 600,
        responseMimeType: "application/json",
      },
      systemInstruction:
        'Return ONLY valid JSON: { "keySkills": string[], "requiredExperience": string, "jobLevel": "Junior"|"Mid"|"Senior" }',
    });

    const result = await model.generateContent(jd.slice(0, 6000));
    const raw = result.response.text();

    const cleaned = raw
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "");

    const parsed = JSON.parse(cleaned) as {
      keySkills?: string[];
      requiredExperience?: string;
      jobLevel?: string;
    };

    return {
      keySkills: Array.isArray(parsed.keySkills)
        ? parsed.keySkills.filter((s) => typeof s === "string").slice(0, 10)
        : fallback.keySkills,
      requiredExperience:
        typeof parsed.requiredExperience === "string"
          ? parsed.requiredExperience
          : fallback.requiredExperience,
      jobLevel:
        typeof parsed.jobLevel === "string" ? parsed.jobLevel : fallback.jobLevel,
    };
  } catch {
    return fallback;
  }
}

async function tailorResumeForRole(
  sourceLatex: string,
  jobDescription: string,
  company: string,
  role: string,
): Promise<string> {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return sourceLatex;
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: GEMINI_FLASH_MODEL,
      safetySettings: SAFETY_SETTINGS,
      generationConfig: {
        temperature: 0.12,
        maxOutputTokens: 4096,
      },
      systemInstruction:
        "You are an ATS resume tailoring engine. Return ONLY raw LaTeX from \\documentclass through \\end{document}. No markdown fences. Mirror JD keywords truthfully.",
    });

    const result = await model.generateContent(
      `Company: ${company}\nRole: ${role}\n\nJob Description:\n${jobDescription}\n\nSource LaTeX:\n${sourceLatex.slice(0, 12000)}\n\nTailor this resume for the role.`,
    );

    const raw = result.response.text();
    const sanitized = sanitizeGeneratedLatex(raw);
    return sanitized || sourceLatex;
  } catch {
    return sourceLatex;
  }
}

function isMissingJobDescriptionColumn(message: string): boolean {
  return /job_description/i.test(message);
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as MonitorAgentBody;
    const companies = (body.companies ?? [])
      .map((c) => c.trim())
      .filter(Boolean);
    const jobTitles = (body.jobTitles ?? [])
      .map((t) => t.trim())
      .filter(Boolean);
    const tick = typeof body.tick === "number" ? body.tick : 0;

    if (companies.length === 0 || jobTitles.length === 0) {
      const idle: MonitorAgentScanResult = {
        agentStatus: "idle",
        tick,
        message: "Add target companies and job titles to activate the scraper agent.",
        match: null,
      };
      return NextResponse.json(idle);
    }

    const listing = pickDemoMatch(companies, jobTitles, tick);

    if (!listing) {
      const scanning: MonitorAgentScanResult = {
        agentStatus: "scanning",
        tick,
        message: `Scan cycle #${tick}: crawling ${companies.length} company portal(s)…`,
        match: null,
      };
      return NextResponse.json(scanning);
    }

    let sourceLatex = getTemplateLatex("classic") ?? "";

    if (body.sourceResumeId) {
      const { data: resumeRow } = await supabase
        .from("resumes")
        .select("content, template")
        .eq("id", body.sourceResumeId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (resumeRow?.content?.latexSource?.trim()) {
        sourceLatex = resumeRow.content.latexSource;
      } else if (resumeRow?.template) {
        sourceLatex = getTemplateLatex(resumeRow.template) ?? sourceLatex;
      }
    }

    const [jdAnalysis, tailoredLatex] = await Promise.all([
      analyzeJobDescription(listing.jobDescription),
      tailorResumeForRole(
        sourceLatex,
        listing.jobDescription,
        listing.company,
        listing.role,
      ),
    ]);

    const tailoredName = `${listing.company} — ${listing.role} (Agent)`;
    const agentNote = `🤖 F.R.I.D.A.Y. Monitor Agent auto-discovered this role on ${listing.portal} at ${new Date().toISOString()}. Tailored resume pre-generated for review.`;

    const { data: resumeInsert, error: resumeError } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        name: tailoredName,
        template: "classic",
        slug: null,
        content: createEmptyResumeContent(tailoredLatex),
        ats_score: null,
        is_public: false,
      })
      .select("id, name")
      .single();

    if (resumeError || !resumeInsert) {
      throw new Error(resumeError?.message ?? "Failed to save tailored resume");
    }

    const jobPayload = {
      user_id: user.id,
      company: listing.company,
      role: listing.role,
      status: "saved" as const,
      applied_at: null,
      resume_id: resumeInsert.id,
      job_url: listing.jobUrl,
      location: listing.portal,
      salary_range: null,
      notes: packJobNotes(agentNote, listing.jobDescription),
      job_description: listing.jobDescription,
    };

    let jobRow: { id: string } | null = null;

    const insertAttempt = await supabase
      .from("job_applications")
      .insert(jobPayload)
      .select("id")
      .single();

    if (insertAttempt.error && isMissingJobDescriptionColumn(insertAttempt.error.message)) {
      const { job_description: omittedColumn, ...packedOnly } = jobPayload;
      void omittedColumn;
      const retry = await supabase
        .from("job_applications")
        .insert(packedOnly)
        .select("id")
        .single();
      if (retry.error) throw new Error(retry.error.message);
      jobRow = retry.data;
    } else if (insertAttempt.error) {
      throw new Error(insertAttempt.error.message);
    } else {
      jobRow = insertAttempt.data;
    }

    if (!jobRow) {
      throw new Error("Failed to create job application card");
    }

    const match: MonitorAgentMatch = {
      matchId: `${listing.id}-${Date.now()}`,
      company: listing.company,
      role: listing.role,
      portal: listing.portal,
      jobUrl: listing.jobUrl,
      jobDescription: listing.jobDescription,
      detectedAt: new Date().toISOString(),
      jdAnalysis,
      tailoredResumeId: resumeInsert.id,
      tailoredResumeName: resumeInsert.name,
      jobApplicationId: jobRow.id,
    };

    const result: MonitorAgentScanResult = {
      agentStatus: "match_found",
      tick,
      message: `Match found: ${listing.role} at ${listing.company}. JD parsed, resume tailored, Saved column updated.`,
      match,
    };

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
