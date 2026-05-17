import type { Metadata } from "next";

import { GeneratePage } from "@/components/generate/generate-page";

export const metadata: Metadata = {
  title: "AI Resume Builder Engine | Tailor Your Resume",
  description:
    "Generate ATS-optimized LaTeX resumes with Groq AI from your profile vault.",
};

export default function GenerateRoutePage() {
  return <GeneratePage />;
}
