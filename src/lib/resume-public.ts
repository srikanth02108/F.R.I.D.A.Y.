import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Resume } from "@/types/database";

/** Fetch a resume only when it is marked public (uses service role when available). */
export async function getPublicResume(resumeId: string): Promise<Resume | null> {
  const admin = createAdminClient();

  if (admin) {
    const { data, error } = await admin
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .maybeSingle();

    if (error || !data || !data.is_public) {
      return null;
    }

    return data as Resume;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", resumeId)
    .eq("is_public", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as Resume;
}

export function getResumeLatexSource(resume: Resume): string {
  return (
    resume.content?.latexSource?.trim() ||
    ""
  );
}
