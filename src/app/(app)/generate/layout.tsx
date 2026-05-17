import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Resume Builder Engine | Tailor Your Resume",
  description: "Generate ATS-optimized LaTeX resumes with Groq AI from your profile vault.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
