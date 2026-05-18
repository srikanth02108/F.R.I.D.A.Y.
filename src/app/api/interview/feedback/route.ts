import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { NextResponse } from "next/server";

import { GEMINI_FLASH_MODEL } from "@/lib/plan-access";

const SYSTEM_PROMPT = `You are an expert executive career coach, communication expert, and technical advisor. Your job is to critique a candidate's practice interview answer rigorously but constructively, providing actionable upgrades.

CRITICAL PROCESSING & STREAMING RULES:
- Stream back your evaluation instantly using clean, raw Markdown formatting.
- Do NOT wrap your entire output in code blocks or fences.
- Start writing immediately; do not output fluff introductions.

Structure your evaluation feedback into these exact visual blocks:
1. ### 🏆 Rating: [Render 1 to 5 visual emoji stars matching performance, e.g., ⭐⭐⭐⭐]
2. ###  What Was Strong: [2-3 concise bullets detailing exactly what they communicated effectively]
3. ### ⚠️ What Was Missing: [2-3 concise bullets highlighting critical gaps, tech metrics, or contextual context they overlooked]
4. ### 🚀 Suggested Star Answer: [Rewrite their answer into a stellar, perfect response utilizing the structured STAR (Situation, Task, Action, Result) template framework cleanly]
5. ### 💡 Keywords & Phrases To Inject: [List 4-5 high-impact industry or role-specific keyword phrases they should say out loud to instantly improve their scoring]`;

type FeedbackBody = {
  question?: string;
  answer?: string;
  jobContext?: string;
};

function buildUserMessage(
  question: string,
  answer: string,
  jobContext: string,
): string {
  return `Evaluate my practice answer based on this context:

Interview Question Asked:
${question}

My Current Answer:
${answer}

Target Job Context:
${jobContext}

Provide your detailed streaming critique following the structured coaching format rules.`;
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
  return "Failed to generate interview feedback";
}

export async function POST(request: Request) {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("[interview/feedback] GOOGLE_GENERATIVE_AI_API_KEY is not configured");
      return NextResponse.json(
        { error: "Interview feedback generation failed" },
        { status: 500 },
      );
    }

    let body: FeedbackBody;

    try {
      body = (await request.json()) as FeedbackBody;
    } catch (error) {
      console.error("[interview/feedback] Invalid JSON body", error);
      return NextResponse.json(
        { error: "Invalid JSON request body" },
        { status: 400 },
      );
    }

    const question = body.question?.trim();
    const answer = body.answer?.trim();
    const jobContext = body.jobContext?.trim();

    if (!question) {
      return NextResponse.json(
        { error: "question is required" },
        { status: 400 },
      );
    }

    if (!answer) {
      return NextResponse.json(
        { error: "answer is required" },
        { status: 400 },
      );
    }

    if (!jobContext) {
      return NextResponse.json(
        { error: "jobContext is required" },
        { status: 400 },
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: GEMINI_FLASH_MODEL,
      safetySettings: SAFETY_SETTINGS,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2500,
      },
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContentStream(
      buildUserMessage(question, answer, jobContext),
    );

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
          console.error("[interview/feedback] Stream error", streamError);
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
    console.error("[interview/feedback] Request failed", error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
