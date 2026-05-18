import { jsPDF } from "jspdf";

import type { AtsScoreResult } from "@/types/ats-score";

const BRAND_BLUE = [32, 85, 253] as const;
const BRAND_GREEN = [14, 184, 122] as const;
const INK = [10, 10, 10] as const;
const MUTED = [107, 107, 107] as const;

function scoreColor(score: number): [number, number, number] {
  if (score >= 85) return [...BRAND_GREEN];
  if (score >= 70) return [...BRAND_BLUE];
  if (score >= 50) return [245, 158, 11];
  return [220, 38, 38];
}

function addPageHeader(doc: jsPDF, title: string) {
  doc.setFillColor(...BRAND_BLUE);
  doc.rect(0, 0, 210, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("F.R.I.D.A.Y. ATS Scorecard", 14, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(title, 196, 14, { align: "right" });
  doc.setTextColor(...INK);
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > 275) {
    doc.addPage();
    addPageHeader(doc, "Continued");
    return 32;
  }
  return y;
}

function wrapText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  for (const line of lines) {
    y = ensureSpace(doc, y, lineHeight);
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

export function buildAtsScorecardPdf(
  result: AtsScoreResult,
  options: { hasJobDescription: boolean; generatedAt?: Date },
): ArrayBuffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const generatedAt = options.generatedAt ?? new Date();
  const dateLabel = generatedAt.toLocaleString();

  addPageHeader(doc, dateLabel);

  let y = 36;

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("ATS Audit Report", 14, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  y = wrapText(
    doc,
    "Deep-parsing token match matrices mapped through the Llama 3.3 70B engine to emulate modern corporate applicant tracking screeners. This scorecard summarizes keyword alignment, structural compliance, and prioritized remediation steps.",
    14,
    y,
    182,
    5,
  );
  y += 6;

  const [r, g, b] = scoreColor(result.overall_score);
  doc.setFillColor(r, g, b);
  doc.roundedRect(14, y, 50, 28, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text(String(result.overall_score), 39, y + 17, { align: "center" });
  doc.setFontSize(9);
  doc.text("OVERALL SCORE", 39, y + 24, { align: "center" });

  doc.setTextColor(...INK);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("F.R.I.D.A.Y. Verified Match", 72, y + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  y = wrapText(
    doc,
    result.overall_score >= 85
      ? "Top-tier alignment with target role parameters."
      : result.overall_score >= 70
        ? "Strong alignment — targeted fixes can reach 95+."
        : "Material gaps detected — apply top fixes below.",
    72,
    y + 14,
    124,
    4.5,
  );
  y += 34;

  const metrics: { label: string; value: number | null }[] = [
    { label: "Keyword Match", value: result.keyword_match_score },
    { label: "Format & Structure", value: result.format_score },
    { label: "Content Completeness", value: result.completeness_score },
    { label: "Metric Quantification", value: result.quantification_score },
    { label: "Readability & Parsing", value: result.readability_score },
  ].filter((m) => m.value !== null || m.label !== "Keyword Match");

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...INK);
  doc.text("Score Breakdown", 14, y);
  y += 8;

  for (const metric of metrics) {
    if (metric.value === null && metric.label === "Keyword Match") continue;
    if (metric.value === null) continue;

    y = ensureSpace(doc, y, 12);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...INK);
    doc.text(metric.label, 14, y);
    doc.text(`${metric.value}/100`, 196, y, { align: "right" });

    const barY = y + 2;
    doc.setFillColor(233, 232, 231);
    doc.roundedRect(14, barY, 182, 3, 1, 1, "F");
    const [mr, mg, mb] = scoreColor(metric.value);
    doc.setFillColor(mr, mg, mb);
    doc.roundedRect(14, barY, (182 * metric.value) / 100, 3, 1, 1, "F");
    y += 10;
  }

  y += 4;
  y = ensureSpace(doc, y, 20);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Top Fixes (+~15 points)", 14, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  result.top_fixes.forEach((fix, index) => {
    y = wrapText(doc, `${index + 1}. ${fix}`, 18, y, 176, 5);
    y += 2;
  });

  if (
    options.hasJobDescription &&
    (result.found_keywords.length > 0 || result.missing_keywords.length > 0)
  ) {
    y += 4;
    y = ensureSpace(doc, y, 16);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Keyword Matrix", 14, y);
    y += 8;

    if (result.found_keywords.length > 0) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...BRAND_GREEN);
      doc.text("Matched tokens", 14, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...INK);
      y = wrapText(doc, result.found_keywords.join(" • "), 14, y, 182, 5);
      y += 4;
    }

    if (result.missing_keywords.length > 0) {
      y = ensureSpace(doc, y, 10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(220, 38, 38);
      doc.text("Missing tokens", 14, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...INK);
      y = wrapText(doc, result.missing_keywords.join(" • "), 14, y, 182, 5);
    }
  }

  if (result.issues.length > 0) {
    doc.addPage();
    addPageHeader(doc, "Issues & Format Checklist");
    y = 32;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Issues & Recommendations", 14, y);
    y += 8;

    for (const issue of result.issues) {
      y = ensureSpace(doc, y, 18);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`[${issue.severity.toUpperCase()}] ${issue.section}`, 14, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      y = wrapText(doc, issue.message, 14, y, 182, 5);
      y = wrapText(doc, `Fix: ${issue.suggestion}`, 14, y + 1, 182, 5);
      y += 4;
    }
  }

  if (result.strengths.length > 0) {
    y = ensureSpace(doc, y + 4, 16);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Strengths", 14, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    for (const strength of result.strengths) {
      y = wrapText(doc, `• ${strength}`, 14, y, 182, 5);
    }
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(
      `F.R.I.D.A.Y. ATS Scorecard — Page ${i} of ${pageCount}`,
      105,
      290,
      { align: "center" },
    );
  }

  return doc.output("arraybuffer");
}
