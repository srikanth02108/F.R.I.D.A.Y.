import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Application Kanban Pipeline Tracker | Tailor Your Resume",
  description: "Track job applications across your hiring pipeline from saved to offer.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
