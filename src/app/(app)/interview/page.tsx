import type { Metadata } from "next";

import { InterviewPrepPage } from "@/components/interview/interview-prep-page";

export const metadata: Metadata = {
  title: "STAR Interview Prep & Coaching Studio | Tailor Your Resume",
  description:
    "Practice interview questions with AI feedback and STAR answer coaching.",
};

export default function InterviewPage() {
  return <InterviewPrepPage />;
}
