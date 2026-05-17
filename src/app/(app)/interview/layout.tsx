import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "STAR Interview Prep & Coaching Studio | Tailor Your Resume",
  description: "Practice interview questions with AI feedback and STAR answer coaching.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
