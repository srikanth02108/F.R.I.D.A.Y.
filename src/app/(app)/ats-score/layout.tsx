import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Algorithmic ATS Score Auditor | Tailor Your Resume",
  description: "Score resume keyword alignment against job descriptions with actionable fixes.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
