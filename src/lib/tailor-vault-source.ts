import { buildMasterResumeLatex } from "@/lib/master-resume-latex";
import { PROFILE_VAULT_SLUG } from "@/lib/profile-vault";
import { createEmptyResumeContent } from "@/lib/resume-content";
import type { ResumeContent, UserProfile } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type MasterResumeSource = {
  profile: UserProfile | null;
  vault: ResumeContent;
  latex: string;
};

export async function fetchMasterResumeSource(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<MasterResumeSource> {
  const [{ data: profileRow }, { data: vaultRow }] = await Promise.all([
    supabase.from("user_profiles").select("*").eq("id", userId).maybeSingle(),
    supabase
      .from("resumes")
      .select("content")
      .eq("user_id", userId)
      .eq("slug", PROFILE_VAULT_SLUG)
      .maybeSingle(),
  ]);

  const profile = (profileRow as UserProfile | null) ?? null;
  const vault = (vaultRow?.content ?? createEmptyResumeContent()) as ResumeContent;
  const latex = buildMasterResumeLatex({ profile, vault });

  return { profile, vault, latex };
}
