import { NextResponse } from "next/server";

import { getPublicResume } from "@/lib/resume-public";

type RouteContext = { params: Promise<{ resumeId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { resumeId } = await context.params;
  const resume = await getPublicResume(resumeId);

  if (!resume) {
    return NextResponse.json(
      { error: "Resume not found or not shared publicly" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    id: resume.id,
    name: resume.name,
    template: resume.template,
    updated_at: resume.updated_at,
    shareToken: resume.content?.shareToken ?? null,
  });
}
