import Groq from "groq-sdk";
import { NextResponse } from "next/server";

import type { ParsedLinkedInProfile } from "@/types/linkedin-import";

const GROQ_MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are an expert data migration engine, resume parser, and professional talent mapper. Your task is to extract unformatted, messy text copied from a LinkedIn profile or PDF export and structure it perfectly into a valid JSON resume schema.

CRITICAL PROCESSING RULES:
- You must respond with a SINGLE, VALID JSON OBJECT ONLY.
- Absolutely NO conversational introductory text, no friendly developer chat, and no trailing block annotations.
- Do NOT wrap your response in markdown code fences (no \`\`\`json or \`\`\` wrappers). The output must begin directly with '{' and terminate with '}'.
- Infer structured dates where applicable (converting 'Jan 2022' text entries cleanly to standard strings or numbers).
- Map achievements and descriptions into string arrays where structured lists are implied.`;

type ImportLinkedInBody = {
  linkedinUrl?: string;
  profileText?: string;
};

function buildUserMessage(linkedinUrl: string, profileText: string): string {
  return `Parse this text data extracted from a candidate's LinkedIn profile and map it accurately into the requested JSON schema layout.

LinkedIn URL Reference: ${linkedinUrl}
Raw Profile Text Payload:
${profileText}

Return a raw JSON object matching this exact structural schema without deviation:
{
  "fullName": "string or null",
  "headline": "string or null",
  "location": "string or null (City, Country formatting)",
  "summary": "string or null (Detailed professional summary extract)",
  "workExperience": [
    {
      "company": "string",
      "title": "string",
      "startDate": "string (e.g., 2022-01 or 2022)",
      "endDate": "string or 'Present'",
      "current": boolean,
      "description": "string",
      "achievements": string[] (array of string bullet points parsed from their role text)
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "fieldOfStudy": "string",
      "startDate": "string",
      "endDate": "string or 'Present'"
    }
  ],
  "skills": string[] (flat array of technical, tool, or language skill names extracted),
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "string"
    }
  ]
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

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = asString(value);
  return text || null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeWorkExperience(value: unknown): ParsedLinkedInProfile["workExperience"] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const company = asString(row.company);
      const title = asString(row.title);
      if (!company && !title) return null;

      const endDate = asString(row.endDate) || "Present";
      const current =
        typeof row.current === "boolean"
          ? row.current
          : endDate.toLowerCase() === "present";

      return {
        company: company || "Unknown",
        title: title || "Role",
        startDate: asString(row.startDate),
        endDate,
        current,
        description: asString(row.description),
        achievements: asStringArray(row.achievements),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

function normalizeEducation(value: unknown): ParsedLinkedInProfile["education"] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const institution = asString(row.institution);
      if (!institution) return null;

      return {
        institution,
        degree: asString(row.degree),
        fieldOfStudy: asString(row.fieldOfStudy),
        startDate: asString(row.startDate),
        endDate: asString(row.endDate) || "Present",
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

function normalizeCertifications(
  value: unknown,
): ParsedLinkedInProfile["certifications"] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const name = asString(row.name);
      if (!name) return null;

      return {
        name,
        issuer: asString(row.issuer),
        date: asString(row.date),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
}

function parseLinkedInResult(raw: string): ParsedLinkedInProfile {
  const parsed = JSON.parse(sanitizeJsonContent(raw)) as Record<string, unknown>;

  return {
    fullName: asStringOrNull(parsed.fullName),
    headline: asStringOrNull(parsed.headline),
    location: asStringOrNull(parsed.location),
    summary: asStringOrNull(parsed.summary),
    workExperience: normalizeWorkExperience(parsed.workExperience),
    education: normalizeEducation(parsed.education),
    skills: asStringArray(parsed.skills),
    certifications: normalizeCertifications(parsed.certifications),
  };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Groq.APIError) {
    if (error.status === 429) {
      return "Groq rate limit exceeded. Please try again in a moment.";
    }
    return error.message || "Groq API request failed";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to parse LinkedIn profile";
}

export async function POST(request: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Groq API key is not configured" },
        { status: 500 },
      );
    }

    let body: ImportLinkedInBody;

    try {
      body = (await request.json()) as ImportLinkedInBody;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400 },
      );
    }

    const profileText = body.profileText?.trim();

    if (!profileText) {
      return NextResponse.json(
        { error: "profileText is required" },
        { status: 400 },
      );
    }

    const linkedinUrl = body.linkedinUrl?.trim() ?? "";

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0.1,
      max_tokens: 3000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: buildUserMessage(linkedinUrl, profileText),
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    if (!raw.trim()) {
      return NextResponse.json(
        { error: "Empty response from parsing service" },
        { status: 500 },
      );
    }

    const result = parseLinkedInResult(raw);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
