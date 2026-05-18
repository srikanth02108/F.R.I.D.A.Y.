import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { NextResponse } from "next/server";

import { GEMINI_FLASH_MODEL } from "@/lib/plan-access";

type JobLevel = "Junior" | "Mid" | "Senior";

type AnalyzeJdBody = {
  jobDescription?: string;
};

type AnalyzeJdResult = {
  keySkills: string[];
  requiredExperience: string;
  jobLevel: JobLevel;
};

function normalizeJobLevel(value: string): JobLevel {
  const normalized = value.toLowerCase();
  if (normalized.includes("senior") || normalized.includes("lead")) {
    return "Senior";
  }
  if (normalized.includes("junior") || normalized.includes("entry")) {
    return "Junior";
  }
  return "Mid";
}

function parseAnalyzeResult(raw: string): AnalyzeJdResult {
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

  const keySkills = Array.isArray(parsed.keySkills)
    ? parsed.keySkills.filter((s) => typeof s === "string" && s.trim()).slice(0, 12)
    : [];

  return {
    keySkills,
    requiredExperience:
      typeof parsed.requiredExperience === "string"
        ? parsed.requiredExperience.trim()
        : "Not specified",
    jobLevel: normalizeJobLevel(
      typeof parsed.jobLevel === "string" ? parsed.jobLevel : "Mid",
    ),
  };
}

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
  return "Failed to analyze job description";
}

export async function POST(request: Request) {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { error: "Google AI API key is not configured" },
        { status: 500 },
      );
    }

    let body: AnalyzeJdBody;

    try {
      body = (await request.json()) as AnalyzeJdBody;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400 },
      );
    }

    const jobDescription = body.jobDescription?.trim();

    if (!jobDescription) {
      return NextResponse.json(
        { error: "jobDescription is required" },
        { status: 400 },
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: GEMINI_FLASH_MODEL,
      safetySettings: SAFETY_SETTINGS,
      generationConfig: {
        temperature: 0.15,
        maxOutputTokens: 600,
        responseMimeType: "application/json",
      },
      systemInstruction:
        'You extract structured hiring requirements from job descriptions. Respond with ONLY valid JSON, no markdown fences. Schema: {"keySkills": string[], "requiredExperience": string, "jobLevel": "Junior"|"Mid"|"Senior"}. keySkills: 5-10 concise skill/tool phrases. requiredExperience: one sentence summary. jobLevel: pick the best single level.',
    });

    const result = await model.generateContent(
      `Analyze this job description:\n\n${jobDescription}`,
    );

    const raw = result.response.text();

    if (!raw.trim()) {
      return NextResponse.json(
        { error: "Empty response from analysis service" },
        { status: 500 },
      );
    }

    const analyzed = parseAnalyzeResult(raw);

    return NextResponse.json(analyzed);
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
