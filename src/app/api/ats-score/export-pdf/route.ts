import { NextResponse } from "next/server";

import { buildAtsScorecardPdf } from "@/lib/ats-scorecard-pdf";
import type { AtsScoreResult } from "@/types/ats-score";

type ExportBody = {
  result?: AtsScoreResult;
  hasJobDescription?: boolean;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ExportBody;

    if (!body.result || typeof body.result.overall_score !== "number") {
      return NextResponse.json(
        { error: "Valid ATS score result is required" },
        { status: 400 },
      );
    }

    const pdfBytes = buildAtsScorecardPdf(body.result, {
      hasJobDescription: Boolean(body.hasJobDescription),
    });

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'attachment; filename="friday-ats-scorecard.pdf"',
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "PDF export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
