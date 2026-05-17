import type { JobApplicationStatus } from "@/types/database";

export const JOB_DESCRIPTION_MARKER = "\n\n---JOB_DESCRIPTION---\n\n";

export type KanbanColumnConfig = {
  status: JobApplicationStatus;
  title: string;
  headerClass: string;
  borderClass: string;
  badgeClass: string;
  avatarClass: string;
};

export const KANBAN_COLUMNS: KanbanColumnConfig[] = [
  {
    status: "saved",
    title: "Saved",
    headerClass: "text-[#46464b]",
    borderClass: "border-[#c7c6cb] bg-[#f5f3f3]",
    badgeClass: "border border-[#c7c6cb] bg-white text-[#46464b]",
    avatarClass: "bg-[#efeded] text-[#46464b]",
  },
  {
    status: "applied",
    title: "Applied",
    headerClass: "text-[#2055FD]",
    borderClass: "border-[#2055FD]/20 bg-[#2055FD]/5",
    badgeClass: "border border-[#2055FD]/20 bg-white text-[#2055FD]",
    avatarClass: "bg-[#2055FD]/10 text-[#2055FD]",
  },
  {
    status: "screening",
    title: "Screening",
    headerClass: "text-amber-900",
    borderClass: "border-amber-200/80 bg-amber-50/60",
    badgeClass: "border border-amber-200 bg-white text-amber-900",
    avatarClass: "bg-amber-100 text-amber-900",
  },
  {
    status: "interview",
    title: "Interview",
    headerClass: "text-[#005233]",
    borderClass: "border-[#0EB87A]/20 bg-[#0EB87A]/5",
    badgeClass: "border border-[#0EB87A]/20 bg-white text-[#005233]",
    avatarClass: "bg-[#0EB87A]/10 text-[#005233]",
  },
  {
    status: "offer",
    title: "Offer",
    headerClass: "text-[#0EB87A]",
    borderClass: "border-[#0EB87A]/30 bg-[#0EB87A]/10",
    badgeClass: "border border-[#0EB87A]/30 bg-white text-[#005233]",
    avatarClass: "bg-[#0EB87A]/15 text-[#005233]",
  },
  {
    status: "rejected",
    title: "Rejected",
    headerClass: "text-red-700",
    borderClass: "border-red-200/80 bg-red-50/50",
    badgeClass: "border border-red-200 bg-white text-red-700",
    avatarClass: "bg-red-100 text-red-700",
  },
];

export const TRACKER_STATUS_OPTIONS = KANBAN_COLUMNS.map((c) => ({
  value: c.status,
  label: c.title,
}));

export function packJobNotes(
  userNotes: string,
  jobDescription: string,
): string | null {
  const notes = userNotes.trim();
  const description = jobDescription.trim();

  if (!notes && !description) return null;
  if (!description) return notes;
  if (!notes) return `${JOB_DESCRIPTION_MARKER}${description}`;
  return `${notes}${JOB_DESCRIPTION_MARKER}${description}`;
}

export function unpackJobNotes(combined: string | null): {
  notes: string;
  jobDescription: string;
} {
  if (!combined) {
    return { notes: "", jobDescription: "" };
  }

  const index = combined.indexOf(JOB_DESCRIPTION_MARKER);
  if (index === -1) {
    return { notes: combined, jobDescription: "" };
  }

  return {
    notes: combined.slice(0, index).trim(),
    jobDescription: combined
      .slice(index + JOB_DESCRIPTION_MARKER.length)
      .trim(),
  };
}

export function splitJobRecordNotes(
  notes: string | null,
  jobDescription: string | null | undefined,
): { notes: string; jobDescription: string } {
  if (jobDescription?.trim()) {
    return {
      notes: notes?.trim() ?? "",
      jobDescription: jobDescription.trim(),
    };
  }

  return unpackJobNotes(notes);
}

export function atsScoreBadgeClass(score: number | null | undefined): string {
  if (score == null || Number.isNaN(score)) {
    return "bg-slate-100 text-slate-600";
  }
  if (score > 80) return "bg-emerald-100 text-emerald-800";
  if (score > 60) return "bg-amber-100 text-amber-900";
  return "bg-red-100 text-red-800";
}

export function formatTrackerDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
