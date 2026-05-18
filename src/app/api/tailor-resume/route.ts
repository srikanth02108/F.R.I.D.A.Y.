import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const GROQ_MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT_MASTER = `You are an elite ATS optimization engineer and LaTeX resume architect operating on Llama 3.3 70B. Your mandate is to produce a job-tailored resume that would score 95+ on enterprise ATS keyword matrices while remaining 100% truthful to the candidate's verified Profile Vault data.

MANDATORY OPTIMIZATION PIPELINE (execute in order):
1. SEMANTIC KEYWORD CLUSTERING — Extract noun phrases, tools, certifications, seniority signals, and domain verbs from the job description. Cluster them into: hard skills, soft skills, industry terms, and role-specific phrases. Map every cluster to vault-backed evidence.
2. PHRASE ALIGNMENT — Mirror exact JD terminology (titles, tech stack, methodologies) in summary, skills, and bullet leads. Replace generic verbs with JD verbs (e.g., "spearheaded" if JD uses it) only when factually supported.
3. SECTION RE-ORDERING — Reorder sections and bullets so JD-critical competencies appear first. Skills before experience if JD is skill-heavy; leadership bullets first for management roles.
4. METRIC QUANTIFICATION DENSITY — Every bullet must include a number, percentage, scale, timeframe, or scope indicator. Derive realistic metrics from vault context; never invent employers or roles.
5. ATS STRUCTURE — Single-column flow, standard section headers (Experience, Education, Skills), no tables/images, standard LaTeX packages only.

MASTER RESUME MODE:
- You receive structured Profile Vault JSON plus a master LaTeX scaffold. Synthesize ALL vault jobs, education, projects, skills, certifications, and events into one cohesive document tailored to the JD.
- Do NOT drop historical roles unless clearly irrelevant; compress with tighter bullets instead.

OUTPUT CONTRACT (non-negotiable):
- Return ONLY raw, complete, valid LaTeX. First character must be backslash-documentclass. Last line must be backslash-end-document.
- NO markdown fences, NO commentary, NO preamble or postamble text.
- Use: geometry, hyperref, enumitem, titlesec, fontenc, inputenc, parskip (use \\usepackage{parskip} without optional args).
- Target 95+ simulated ATS match. One page unless vault depth requires two pages maximum.

TRUTHFULNESS: Never fabricate employers, degrees, tools, or dates not supported by vault or provided resume data.`;

const SYSTEM_PROMPT_LATEX_ONLY = `You are an elite ATS optimization engineer and LaTeX resume architect operating on Llama 3.3 70B. Rewrite ONLY the provided LaTeX source for the target job description. Do NOT import external profile data, vault fields, or skills not already present in the source document unless they are clearly implied by existing content.

MANDATORY OPTIMIZATION PIPELINE (execute in order):
1. SEMANTIC KEYWORD CLUSTERING — Extract and cluster JD keywords; map each to existing resume content only.
2. PHRASE ALIGNMENT — Mirror JD terminology in summary, skills, and bullet leads without adding unverified credentials.
3. SECTION RE-ORDERING — Reorder bullets/sections for JD relevance while preserving document structure.
4. METRIC QUANTIFICATION DENSITY — Upgrade bullets with numbers/percentages already implied or stated; add conservative estimates only when context supports them.
5. ATS STRUCTURE — Preserve valid LaTeX structure; standard packages only.

OUTPUT CONTRACT (non-negotiable):
- Return ONLY raw, complete, valid LaTeX from \\documentclass through \\end{document}.
- NO markdown fences, NO commentary.
- Target 95+ simulated ATS match on the given JD.
- Strict rewrite of the input string only — no external vault parameters.`;

type TailorResumeBody = {
  jobDescription?: string;
  currentResume?: string;
  userProfile?: Record<string, unknown>;
  useMasterResume?: boolean;
  profileVault?: Record<string, unknown>;
};

function buildUserMessage(
  jobDescription: string,
  currentResume: string,
  useMasterResume: boolean,
  userProfile: Record<string, unknown>,
  profileVault: Record<string, unknown>,
): string {
  if (useMasterResume) {
    return `TARGET JOB DESCRIPTION:
${jobDescription}

MASTER LATEX SCAFFOLD (refine and fully populate from vault):
${currentResume}

PROFILE VAULT (structured source of truth — use every relevant entry):
${JSON.stringify(profileVault, null, 2)}

USER PROFILE METADATA:
${JSON.stringify(userProfile, null, 2)}

Deliver a 95+ ATS-aligned LaTeX resume tailored to this JD. Apply keyword clustering, phrase alignment, section re-ordering, and metric density. Output clean raw LaTeX only.`;
  }

  return `TARGET JOB DESCRIPTION:
${jobDescription}

CURRENT RESUME (LaTeX — rewrite this document only, no external data):
${currentResume}

Deliver a 95+ ATS-aligned LaTeX resume. Apply keyword clustering, phrase alignment, section re-ordering, and metric density. Output clean raw LaTeX only.`;
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

  return "Failed to tailor resume";
}

export async function POST(request: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Groq API key is not configured" },
        { status: 500 },
      );
    }

    let body: TailorResumeBody;

    try {
      body = (await request.json()) as TailorResumeBody;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400 },
      );
    }

    const jobDescription = body.jobDescription?.trim();
    const currentResume = body.currentResume?.trim();
    const useMasterResume = Boolean(body.useMasterResume);
    const userProfile =
      body.userProfile && typeof body.userProfile === "object"
        ? body.userProfile
        : {};
    const profileVault =
      body.profileVault && typeof body.profileVault === "object"
        ? body.profileVault
        : {};

    if (!jobDescription) {
      return NextResponse.json(
        { error: "jobDescription is required" },
        { status: 400 },
      );
    }

    if (!currentResume) {
      return NextResponse.json(
        { error: "currentResume is required" },
        { status: 400 },
      );
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completionStream = await groq.chat.completions.create({
      model: GROQ_MODEL,
      temperature: 0.12,
      max_tokens: 8192,
      stream: true,
      messages: [
        {
          role: "system",
          content: useMasterResume
            ? SYSTEM_PROMPT_MASTER
            : SYSTEM_PROMPT_LATEX_ONLY,
        },
        {
          role: "user",
          content: buildUserMessage(
            jobDescription,
            currentResume,
            useMasterResume,
            userProfile,
            profileVault,
          ),
        },
      ],
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completionStream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`),
              );
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (streamError) {
          const message = getErrorMessage(streamError);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`),
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
