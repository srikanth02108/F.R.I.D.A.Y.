import type { Metadata } from "next";

import { TailorPage } from "@/components/tailor/tailor-page";

export const metadata: Metadata = {
  title: "Contextual Job Optimization Center | Tailor Your Resume",
  description:
    "Tailor resumes and cover letters to specific job descriptions with AI.",
};

export default function TailorRoutePage() {
  return <TailorPage />;
}
