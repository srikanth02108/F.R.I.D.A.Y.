import type { Resume } from "@/types/database";

export const RESUME_SELECT_NAME_FIELDS = "id, name, template, content" as const;
export const RESUME_SELECT_NAME_ATS = "id, name, ats_score" as const;
export const RESUME_SELECT_DASHBOARD =
  "id, name, template, ats_score, updated_at, slug" as const;

export function resumeDisplayName(
  row: Pick<Resume, "name"> | { name?: string | null },
): string {
  const value = row.name?.trim();
  return value && value.length > 0 ? value : "Untitled Resume";
}
