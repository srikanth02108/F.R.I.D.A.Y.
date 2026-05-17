import type { Metadata } from "next";

import { AtsScorePage } from "@/components/ats-score/ats-score-page";

export const metadata: Metadata = {
  title: "Algorithmic ATS Score Auditor | Tailor Your Resume",
  description:
    "Score resume keyword alignment against job descriptions with actionable fixes.",
};

export default function AtsScoreRoutePage() {
  return <AtsScorePage />;
}
