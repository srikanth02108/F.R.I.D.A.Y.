export function HeroMockup() {
  const latexLines = [
    "\\documentclass{article}",
    "\\begin{document}",
    "\\section{Experience}",
    "\\textbf{Software Engineer} — Acme Corp",
    "Led migration to microservices; cut deploy time 40\\%",
    "\\section{Skills}",
    "TypeScript, React, Node.js, AWS",
    "\\end{document}",
  ];

  return (
    <div className="relative w-full max-w-5xl overflow-hidden rounded-xl border border-[#e9e8e7] bg-[#0a0a0f] shadow-[0px_10px_40px_rgba(10,10,10,0.1)]">
      <div className="flex items-center gap-2 border-b border-white/10 bg-[#12121a] px-4 py-3">
        <span className="size-2.5 rounded-full bg-red-500/90" />
        <span className="size-2.5 rounded-full bg-amber-500/90" />
        <span className="size-2.5 rounded-full bg-emerald-500/90" />
        <span className="ml-3 font-mono text-xs tracking-wide text-slate-400">
          tailor-your-resume · editor
        </span>
      </div>

      <div className="grid md:grid-cols-2">
        <div className="border-b border-white/10 bg-[#1e1e1e] p-4 md:border-r md:border-b-0">
          <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.05em] text-slate-500">
            Monaco · LaTeX
          </p>
          <pre className="overflow-hidden font-mono text-[11px] leading-relaxed text-slate-300">
            {latexLines.map((line, index) => (
              <div key={line} className="flex gap-3">
                <span className="select-none text-slate-600">{index + 1}</span>
                <span
                  className={
                    line.startsWith("\\")
                      ? "text-[#6b8cff]"
                      : "text-slate-200"
                  }
                >
                  {line}
                </span>
              </div>
            ))}
          </pre>
        </div>

        <div className="bg-white p-5">
          <p className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.05em] text-[#6B6B6B]">
            Live preview
          </p>
          <div className="space-y-3 rounded-lg border border-[#e9e8e7] bg-[#f5f3f3] p-4 text-left shadow-[0px_4px_20px_rgba(15,17,23,0.04)]">
            <div>
              <h3 className="text-lg font-bold text-[#1b1c1c]">Alex Rivera</h3>
              <p className="text-xs text-[#6B6B6B]">
                alex@email.com · Mumbai, India
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.05em] text-[#2055FD]">
                Summary
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#46464b]">
                Full-stack engineer with 4+ years shipping scalable products.
                Expert in React, Node.js, and cloud-native delivery.
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.05em] text-[#2055FD]">
                Experience
              </p>
              <p className="mt-1 text-xs font-semibold text-[#1b1c1c]">
                Software Engineer — Acme Corp
              </p>
              <ul className="mt-1 list-inside list-disc text-xs text-[#6B6B6B]">
                <li>Reduced deploy time 40% via CI/CD overhaul</li>
                <li>Owned payments microservice serving 2M+ users</li>
              </ul>
            </div>
            <div className="flex flex-wrap gap-1">
              {["React", "TypeScript", "AWS", "PostgreSQL"].map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-[#2055FD]/10 px-2 py-0.5 text-[10px] font-medium text-[#2055FD]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
