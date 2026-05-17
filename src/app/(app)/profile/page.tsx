import type { Metadata } from "next";

import { ProfilePage } from "@/components/profile/profile-page";

export const metadata: Metadata = {
  title: "My Personal Info Vault | Tailor Your Resume",
  description:
    "Manage your professional profile, skills, and LinkedIn import vault.",
};

export default function Page() {
  return <ProfilePage />;
}
