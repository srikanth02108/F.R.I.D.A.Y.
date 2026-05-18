import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { NextResponse } from "next/server";

import { getGeminiModelForPlan } from "@/lib/plan-access";
import {
  assertAiGenerationAllowed,
  getAuthenticatedUserPlan,
} from "@/lib/plan-server";

const SYSTEM_PROMPT = `You are an expert resume writer and LaTeX typesetter. You help job seekers create professional, ATS-optimized resumes. When given a user's background description and their profile information, you generate a complete, valid LaTeX resume document. 

CRITICAL OUTPUT RULES:
- Return ONLY the raw, complete, valid LaTeX document. 
- Absolutely NO conversational text before or after the code. 
- Do NOT wrap the code in markdown code fences (no \`\`\`latex or \`\`\` blocks). The response must start immediately with \\documentclass and end with \\end{document}.
- Do NOT use markdown code blocks. Output the raw LaTeX string starting with \\documentclass.
- Make the resume ATS-friendly: no tables for layout, no multi-column layouts, use clear section headings.
- Use strong action verbs (Led, Built, Developed, Increased, Reduced, Managed).
- Quantify achievements wherever possible (add realistic placeholder numbers if none are explicitly provided).
- Keep it to exactly one page.
- Include all standard sections: Contact, Summary, Experience, Education, Skills, Projects (if applicable).
- LATEX PACKAGE RULE: Use standard packages only (geometry, hyperref, enumitem, titlesec, fontenc, inputenc, parskip). When loading parskip, do NOT pass it as an option (use \\usepackage{parskip}, never \\usepackage[parskip]{parskip}), to ensure it compiles flawlessly.`;

type GenerateResumeBody = {
  description?: string;
  template?: string;
  templateCode?: string;
  userProfile?: Record<string, unknown>;
};

function buildUserMessage(
  description: string,
  template: string,
  userProfile: Record<string, unknown>,
  templateCode?: string,
): string {
  let msg = `User description: ${description}\n\nUser profile data: ${JSON.stringify(userProfile)}\n\nGenerate a complete LaTeX resume using the ${template} template style. Fill in as much real information from the user profile as possible while utilizing the user description for specific optimization targeting.`;

  if (templateCode) {
    msg += `\n\nHere is the exact LaTeX code for the template style you MUST use. Use this structure, layout, and commands as your foundation:\n\n${templateCode}`;
  }

  return msg;
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
  return "Failed to generate resume";
}

export async function POST(request: Request) {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json(
        { error: "Google AI API key is not configured" },
        { status: 500 },
      );
    }

    let body: GenerateResumeBody;

    try {
      body = (await request.json()) as GenerateResumeBody;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400 },
      );
    }

    const description = body.description?.trim();
    const template = body.template?.trim();
    const templateCode = body.templateCode?.trim();
    const userProfile =
      body.userProfile && typeof body.userProfile === "object"
        ? body.userProfile
        : {};

    if (!description) {
      return NextResponse.json(
        { error: "description is required" },
        { status: 400 },
      );
    }

    if (!template) {
      return NextResponse.json(
        { error: "template is required" },
        { status: 400 },
      );
    }

    const authPlan = await getAuthenticatedUserPlan();
    if (!authPlan.ok) {
      return authPlan.response;
    }

    const generationBlocked = assertAiGenerationAllowed(authPlan.snapshot);
    if (generationBlocked) {
      return generationBlocked;
    }

    const modelName = getGeminiModelForPlan(authPlan.snapshot.plan);
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: modelName,
      safetySettings: SAFETY_SETTINGS,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 4000,
      },
      systemInstruction: SYSTEM_PROMPT,
    });

    const userMessage = buildUserMessage(description, template, userProfile, templateCode);
    const result = await model.generateContentStream(userMessage);

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
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
