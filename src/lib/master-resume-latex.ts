import { escapeLatex, latexHref } from "@/lib/latex-escape";
import type {
  CareerEvent,
  Certification,
  Education,
  Project,
  ResumeContent,
  Skill,
  UserProfile,
  WorkExperience,
} from "@/types/database";

export type MasterResumeInput = {
  profile: Pick<
    UserProfile,
    | "full_name"
    | "email"
    | "headline"
    | "location"
    | "phone"
    | "linkedin_url"
    | "github_url"
    | "website_url"
  > | null;
  vault: ResumeContent;
};

function formatDateRange(start: string, end: string | null, current?: boolean): string {
  const startPart = start?.trim() || "";
  const endPart = current ? "Present" : end?.trim() || "";
  if (startPart && endPart) return `${escapeLatex(startPart)} -- ${escapeLatex(endPart)}`;
  if (startPart) return escapeLatex(startPart);
  if (endPart) return escapeLatex(endPart);
  return "";
}

function contactLine(profile: MasterResumeInput["profile"]): string {
  const parts: string[] = [];
  if (profile?.email) {
    parts.push(`\\href{mailto:${profile.email}}{${escapeLatex(profile.email)}}`);
  }
  if (profile?.phone) parts.push(escapeLatex(profile.phone));
  if (profile?.location) parts.push(escapeLatex(profile.location));
  if (profile?.linkedin_url) parts.push(latexHref(profile.linkedin_url));
  if (profile?.github_url) parts.push(latexHref(profile.github_url));
  if (profile?.website_url) parts.push(latexHref(profile.website_url));
  return parts.join(" \\textbar\\ ");
}

function renderWorkExperience(items: WorkExperience[]): string {
  if (items.length === 0) {
    return "\\textit{No work experience entries in your profile vault yet.}\n";
  }

  return items
    .map((job) => {
      const range = formatDateRange(job.startDate, job.endDate, job.current);
      const bullets = [
        ...(job.description?.trim()
          ? [`  \\item ${escapeLatex(job.description.trim())}`]
          : []),
        ...job.achievements
          .filter((a) => a.trim())
          .map((a) => `  \\item ${escapeLatex(a.trim())}`),
      ];

      const list =
        bullets.length > 0
          ? `\\begin{itemize}[leftmargin=*, nosep]\n${bullets.join("\n")}\n\\end{itemize}`
          : "";

      return `\\textbf{${escapeLatex(job.title || "Role")}} \\hfill ${range}\\\\
\\textit{${escapeLatex(job.company || "Company")}}
${list}
\\vspace{8pt}
`;
    })
    .join("\n");
}

function renderEducation(items: Education[]): string {
  if (items.length === 0) {
    return "\\textit{No education entries in your profile vault yet.}\n";
  }

  return items
    .map((edu) => {
      const range = formatDateRange(edu.startDate, edu.endDate);
      const degreeLine = [edu.degree, edu.field].filter(Boolean).join(", ");
      const grade = edu.grade?.trim() ? ` \\textbar\\ GPA: ${escapeLatex(edu.grade)}` : "";

      return `\\textbf{${escapeLatex(degreeLine || "Degree")}}${grade} \\hfill ${range}\\\\
${escapeLatex(edu.institution || "Institution")}
\\vspace{6pt}
`;
    })
    .join("\n");
}

function renderProjects(items: Project[]): string {
  if (items.length === 0) {
    return "\\textit{No project entries in your profile vault yet.}\n";
  }

  return items
    .map((project) => {
      const tech =
        project.technologies.length > 0
          ? ` \\textbar\\ ${escapeLatex(project.technologies.join(", "))}`
          : "";
      const link = project.link ? ` \\hfill ${latexHref(project.link)}` : "";
      const highlights = project.highlights
        .filter((h) => h.trim())
        .map((h) => `  \\item ${escapeLatex(h.trim())}`)
        .join("\n");
      const desc = project.description?.trim()
        ? `  \\item ${escapeLatex(project.description.trim())}`
        : "";
      const bullets = [desc, highlights].filter(Boolean).join("\n");
      const list =
        bullets.length > 0
          ? `\\begin{itemize}[leftmargin=*, nosep]\n${bullets}\n\\end{itemize}`
          : "";

      return `\\textbf{${escapeLatex(project.name)}}${tech}${link}
${list}
\\vspace{6pt}
`;
    })
    .join("\n");
}

function renderSkills(items: Skill[]): string {
  if (items.length === 0) {
    return "\\textit{No skills listed in your profile vault yet.}\n";
  }

  const byCategory = new Map<string, Skill[]>();
  for (const skill of items) {
    const category = skill.category?.trim() || "General";
    const list = byCategory.get(category) ?? [];
    list.push(skill);
    byCategory.set(category, list);
  }

  return Array.from(byCategory.entries())
    .map(([category, skills]) => {
      const names = skills
        .map((s) => `${escapeLatex(s.name)} (${escapeLatex(s.level)})`)
        .join(", ");
      return `\\textbf{${escapeLatex(category)}:} ${names}\\\\`;
    })
    .join("\n");
}

function renderCertifications(items: Certification[]): string {
  if (items.length === 0) {
    return "\\textit{No certifications recorded. Add them via LinkedIn import or future vault fields.}\n";
  }

  return items
    .map((cert) => {
      const date = cert.date?.trim() ? ` \\hfill ${escapeLatex(cert.date)}` : "";
      return `\\textbf{${escapeLatex(cert.name)}}${date}\\\\
\\textit{${escapeLatex(cert.issuer)}}
\\vspace{4pt}
`;
    })
    .join("\n");
}

function renderCareerEvents(items: CareerEvent[]): string {
  if (items.length === 0) {
    return "\\textit{No career events recorded.}\n";
  }

  return items
    .map((event) => {
      const date = event.date?.trim() ? ` \\hfill ${escapeLatex(event.date)}` : "";
      const body = event.description?.trim()
        ? `\n${escapeLatex(event.description.trim())}`
        : "";
      return `\\textbf{${escapeLatex(event.title)}}${date}${body}
\\vspace{6pt}
`;
    })
    .join("\n");
}

export function buildMasterResumeLatex(input: MasterResumeInput): string {
  const { profile, vault } = input;
  const displayName =
    profile?.full_name?.trim() || "Professional Profile";
  const headline = profile?.headline?.trim() || "Master Career Portfolio";
  const contact = contactLine(profile);
  const summary =
    vault.summary?.trim() ||
    "Comprehensive master document aggregating your complete professional background from the F.R.I.D.A.Y. profile vault.";

  return String.raw`\documentclass[11pt,a4paper]{article}

\usepackage[T1]{fontenc}
\usepackage[utf8]{inputenc}
\usepackage{parskip}
\setlength{\parskip}{6pt}
\setlength{\parindent}{0pt}
\usepackage[margin=0.75in]{geometry}
\usepackage{enumitem}
\usepackage{titlesec}
\usepackage{hyperref}

\hypersetup{colorlinks=true, linkcolor=black, urlcolor=black}

\titleformat{\section}{\Large\bfseries}{}{0em}{}[\titlerule]
\titlespacing*{\section}{0pt}{12pt}{8pt}

\pagestyle{empty}

\begin{document}

\begin{center}
  {\LARGE\bfseries ${escapeLatex(displayName)}}\\[6pt]
  {\large ${escapeLatex(headline)}}\\[8pt]
  ${contact || escapeLatex("Contact details available in your profile settings.")}
\end{center}

\section{Executive Summary}
${escapeLatex(summary)}

\section{Professional Experience}
${renderWorkExperience(vault.workExperience ?? [])}

\section{Education}
${renderEducation(vault.education ?? [])}

\section{Projects}
${renderProjects(vault.projects ?? [])}

\section{Technical Skills}
${renderSkills(vault.skills ?? [])}

\section{Certifications}
${renderCertifications(vault.certifications ?? [])}

\section{Career Events \& Milestones}
${renderCareerEvents(vault.careerEvents ?? [])}

\vfill
\begin{center}
  \small\textit{Master portfolio generated by F.R.I.D.A.Y. --- includes your complete vault history.}
\end{center}

\end{document}
`;

}
