import { NextResponse } from "next/server";

import { compileLatexToPdfBuffer } from "@/lib/latex-compile-server";
import { getTemplateLatex } from "@/lib/templates";
import { getPublicResume, getResumeLatexSource } from "@/lib/resume-public";

type RouteContext = { params: Promise<{ resumeId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { resumeId } = await context.params;
    const resume = await getPublicResume(resumeId);

    if (!resume) {
      return NextResponse.json(
        { error: "Resume not found or not shared publicly" },
        { status: 404 },
      );
    }

    const latex =
      getResumeLatexSource(resume) ||
      getTemplateLatex(resume.template) ||
      "";

    if (!latex.trim()) {
      return NextResponse.json(
        { error: "Resume has no compilable LaTeX content" },
        { status: 422 },
      );
    }

    const pdfBuffer = await compileLatexToPdfBuffer(latex);
    const filename = `${resume.name.replace(/\s+/g, "-").toLowerCase() || "resume"}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "PDF generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
