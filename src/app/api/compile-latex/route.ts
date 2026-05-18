import { NextResponse } from "next/server";

import { compileLatexToPdfBuffer } from "@/lib/latex-compile-server";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let latex: string | undefined;

    if (contentType.includes("application/json")) {
      const body = (await request.json()) as { latex?: string };
      latex = body.latex;
    } else if (
      contentType.includes("text/plain") ||
      contentType.includes("application/x-tex")
    ) {
      latex = await request.text();
    } else {
      const body = (await request.json().catch(() => null)) as {
        latex?: string;
      } | null;
      latex = body?.latex;
    }

    if (!latex?.trim()) {
      return NextResponse.json(
        { error: "LaTeX content is required" },
        { status: 400 },
      );
    }

    const pdfBuffer = await compileLatexToPdfBuffer(latex);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="resume.pdf"',
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Compilation request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
