const LATEX_COMPILER_URL = "https://texlive.net/cgi-bin/latexcgi";

export async function compileLatexToPdfBuffer(latex: string): Promise<ArrayBuffer> {
  if (!latex.trim()) {
    throw new Error("LaTeX content is required");
  }

  // texlive.net requires multipart/form-data with array-style field names.
  // The main file MUST be named "document.tex".
  const formData = new FormData();
  formData.append("filecontents[]", latex);
  formData.append("filename[]", "document.tex");
  formData.append("engine", "pdflatex");
  formData.append("return", "pdf");

  const response = await fetch(LATEX_COMPILER_URL, {
    method: "POST",
    body: formData,
    // Let fetch set the Content-Type with the correct boundary
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Compilation failed");
    throw new Error(errorText || "LaTeX compilation failed");
  }

  // texlive.net returns a log/text file on compilation errors instead of a
  // PDF, even with a 200 status. Check the Content-Type to detect this.
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("pdf")) {
    const logText = await response.text().catch(() => "");
    // Try to extract the first meaningful error line from the TeX log
    const errorLine = logText
      .split("\n")
      .find((line) => line.startsWith("!") || line.includes("Error"));
    throw new Error(
      errorLine?.trim() ||
        "LaTeX compilation failed. Check your source for syntax errors.",
    );
  }

  return response.arrayBuffer();
}
