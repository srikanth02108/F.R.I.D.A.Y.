import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advanced LaTeX Resume Editor | Tailor Your Resume",
  description: "Edit LaTeX resume source with live preview and Supabase persistence.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
