import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { NextResponse } from "next/server";

import { GEMINI_PRO_MODEL } from "@/lib/plan-access";
import {
  assertAiGenerationAllowed,
  getAuthenticatedUserPlan,
} from "@/lib/plan-server";
import type { AtsIssue, AtsScoreResult } from "@/types/ats-score";

const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) compatibility auditor and professional technical recruiter. Your job is to deeply analyze resumes for parsing compatibility, keyword matching, metric quantification, and structural clarity. 

CRITICAL OUTPUT CONTROL RULES:
- You must respond with a SINGLE, VALID JSON OBJECT ONLY.
- Absolutely NO conversational introductory text, no pleasantries, and no trailing notes.
- Do NOT wrap your response in markdown code fences (no \`\`\`json or \`\`\` blocks). The output string must start immediately with '{' and end with '}'.
- Every key specified in the schema must be populated. Do not hallucinate fields or truncate string arrays.`;

type AtsScoreBody = {
  resumeText?: string;
  jobDescription?: string;
};

function buildUserMessage(resumeText: string, jobDescription?: string): string {
  const jd = jobDescription?.trim() || "Not provided";

  return `Analyze this resume for ATS compatibility. If a job description is provided, also score the keyword match.

Resume text to evaluate:
${resumeText}

Job Description (optional):
${jd}

Return a JSON object matching this exact TypeScript structure without deviation:
{
  "overall_score": number (0-100),
  "keyword_match_score": number (0-100, or null if no job description was provided),
  "format_score": number (0-100),
  "completeness_score": number (0-100),
  "quantification_score": number (0-100),
  "readability_score": number (0-100),
  "missing_keywords": string[] (extract missing high-impact keywords if job description is provided, else return an empty array []),
  "found_keywords": string[] (extract successfully matched keywords if job description is provided, else return an empty array []),
  "issues": [
    {
      "section": string (e.g., 'Summary', 'Experience', 'Skills', 'Formatting'),
      "severity": "high" | "medium" | "low",
      "message": string,
      "suggestion": string
    }
  ],
  "strengths": string[] (array of items done exceptionally well),
  "top_fixes": string[] (exactly the top 3 most impactful fix action statements, ordered strictly by down-funnel metric impact)
}`;
}

function sanitizeJsonContent(raw: string): string {
  let cleaned = raw.trim();

  cleaned = cleaned.replace(/^```json\s*/i, "");
  cleaned = cleaned.replace(/^```\s*/i, "");
  cleaned = cleaned.replace(/\s*```$/i, "");

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1);
  }

  return cleaned;
}

function clampScore(value: unknown): number {
  const num = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.min(100, Math.max(0, Math.round(num)));
}

function normalizeIssue(issue: unknown): AtsIssue {
  const record = (issue ?? {}) as Record<string, unknown>;
  const severity = record.severity;

  return {
    section:
      typeof record.section === "string" ? record.section : "General",
    severity:
      severity === "high" || severity === "medium" || severity === "low"
        ? severity
        : "medium",
    message: typeof record.message === "string" ? record.message : "",
    suggestion:
      typeof record.suggestion === "string" ? record.suggestion : "",
  };
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function normalizeTopFixes(value: unknown): string[] {
  const fixes = normalizeStringArray(value).slice(0, 3);
  while (fixes.length < 3) {
    fixes.push("Review and refine resume content for ATS clarity.");
  }
  return fixes;
}

function normalizeAtsScoreResult(raw: unknown, hasJobDescription: boolean): AtsScoreResult {
  const data = (raw ?? {}) as Record<string, unknown>;

  const keywordMatchRaw = data.keyword_match_score;

  return {
    overall_score: clampScore(data.overall_score),
    keyword_match_score:
      hasJobDescription && keywordMatchRaw !== null && keywordMatchRaw !== undefined
        ? clampScore(keywordMatchRaw)
        : null,
    format_score: clampScore(data.format_score),
    completeness_score: clampScore(data.completeness_score),
    quantification_score: clampScore(data.quantification_score),
    readability_score: clampScore(data.readability_score),
    missing_keywords: normalizeStringArray(data.missing_keywords),
    found_keywords: normalizeStringArray(data.found_keywords),
    issues: Array.isArray(data.issues)
      ? data.issues.map(normalizeIssue)
      : [],
    strengths: normalizeStringArray(data.strengths),
    top_fixes: normalizeTopFixes(data.top_fixes),
  };
}

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];

function getErrorDetails(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error";
}

export async function POST(request: Request) {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        {
          error: "ATS Scoring failed to compile valid structure",
          details: "Google AI API key is not configured",
        },
        { status: 500 },
      );
    }

    let body: AtsScoreBody;

    try {
      body = (await request.json()) as AtsScoreBody;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400 },
      );
    }

    const resumeText = body.resumeText?.trim();

    if (!resumeText) {
      return NextResponse.json(
        { error: "resumeText is required" },
        { status: 400 },
      );
    }

    const jobDescription = body.jobDescription?.trim();
    const hasJobDescription = Boolean(jobDescription);

    const authPlan = await getAuthenticatedUserPlan();
    if (!authPlan.ok) {
      return authPlan.response;
    }

    const generationBlocked = assertAiGenerationAllowed(authPlan.snapshot);
    if (generationBlocked) {
      return generationBlocked;
    }

    // ATS scoring uses gemini-1.5-pro for higher reasoning quality
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: GEMINI_PRO_MODEL,
      safetySettings: SAFETY_SETTINGS,
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 3000,
        responseMimeType: "application/json",
      },
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent(
      buildUserMessage(resumeText, jobDescription),
    );

    const rawContent = result.response.text();

    if (!rawContent.trim()) {
      return NextResponse.json(
        {
          error: "ATS Scoring failed to compile valid structure",
          details: "Gemini returned an empty response",
        },
        { status: 500 },
      );
    }

    const sanitized = sanitizeJsonContent(rawContent);
    const parsed = JSON.parse(sanitized) as unknown;
    const normalizedResult = normalizeAtsScoreResult(parsed, hasJobDescription);

    return NextResponse.json(normalizedResult, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "ATS Scoring failed to compile valid structure",
        details: getErrorDetails(error),
      },
      { status: 500 },
    );
  }
}
