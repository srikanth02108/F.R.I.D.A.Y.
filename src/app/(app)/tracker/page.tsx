import type { Metadata } from "next";

import { JobTrackerPage } from "@/components/tracker/job-tracker-page";

export const metadata: Metadata = {
  title: "Application Kanban Pipeline Tracker | Tailor Your Resume",
  description:
    "Track job applications across your hiring pipeline from saved to offer.",
};

export default function TrackerPage() {
  return <JobTrackerPage />;
}
