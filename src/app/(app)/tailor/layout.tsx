import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contextual Job Optimization Center | Tailor Your Resume",
  description: "Tailor resumes and cover letters to specific job descriptions with AI.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
