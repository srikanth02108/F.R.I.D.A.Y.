import type { Metadata } from "next";

import { DashboardPage } from "@/components/dashboard/dashboard-page";

export const metadata: Metadata = {
  title: "Workspace Dashboard | Tailor Your Resume",
  description:
    "Your live resume analytics, application pipeline metrics, and quick actions.",
};

export default function DashboardRoutePage() {
  return <DashboardPage />;
}
