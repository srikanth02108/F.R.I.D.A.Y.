/** Escape plain text for safe inclusion in LaTeX document bodies. */
export function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/[&%$#_{}]/g, (char) => {
      const map: Record<string, string> = {
        "&": "\\&",
        "%": "\\%",
        $: "\\$",
        "#": "\\#",
        _: "\\_",
        "{": "\\{",
        "}": "\\}",
      };
      return map[char] ?? char;
    })
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

export function latexHref(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  const safe = escapeLatex(trimmed.replace(/^https?:\/\//i, ""));
  return `\\href{${trimmed}}{${safe}}`;
}
