import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Personal Info Vault | Tailor Your Resume",
  description: "Manage your professional profile, skills, and LinkedIn import vault.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
