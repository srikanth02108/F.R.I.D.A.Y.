const COMPILE_API = "/api/compile-latex";

export async function compileLatexToPdfBlob(latex: string): Promise<Blob> {
  const response = await fetch(COMPILE_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ latex }),
  });

  if (!response.ok) {
    // Try to read a structured JSON error first, then fall back to raw text
    let errorMessage = "LaTeX compilation failed";
    try {
      const payload = (await response.clone().json()) as { error?: string } | null;
      if (payload?.error) {
        errorMessage = payload.error;
      }
    } catch {
      const text = await response.text().catch(() => "");
      if (text.trim()) errorMessage = text.trim();
    }
    throw new Error(errorMessage);
  }

  // Read raw bytes then explicitly re-wrap with application/pdf so browsers
  // always treat the ObjectURL as a PDF, regardless of what fetch infers.
  const rawBlob = await response.blob();

  if (rawBlob.size === 0) {
    throw new Error(
      "Compiler returned an empty file. Check your LaTeX source for errors.",
    );
  }

  // Re-wrap with an explicit MIME type so PDF.js / the iframe never complains.
  const pdfBlob = new Blob([rawBlob], { type: "application/pdf" });
  return pdfBlob;
}

export function sanitizeResumeFilename(name: string): string {
  const base = name.trim() || "resume";
  return `${base.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").toLowerCase()}.pdf`;
}

export function downloadPdfBlob(blob: Blob, filename: string): void {
  // Always ensure the download blob has the correct MIME type too
  const pdfBlob = blob.type === "application/pdf"
    ? blob
    : new Blob([blob], { type: "application/pdf" });

  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
