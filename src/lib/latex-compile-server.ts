const LATEX_ONLINE_URL = "https://latexonline.cc/compile";

export async function compileLatexToPdfBuffer(latex: string): Promise<ArrayBuffer> {
  if (!latex.trim()) {
    throw new Error("LaTeX content is required");
  }

  let response = await fetch(LATEX_ONLINE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ text: latex }),
  });

  if (!response.ok) {
    const compileUrl = `${LATEX_ONLINE_URL}?text=${encodeURIComponent(latex)}`;
    response = await fetch(compileUrl, { method: "GET" });
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Compilation failed");
    throw new Error(errorText || "LaTeX compilation failed");
  }

  return response.arrayBuffer();
}
