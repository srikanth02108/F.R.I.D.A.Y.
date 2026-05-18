import type { Database, UserProfile } from "@/types/database";

/** Columns loaded/saved from the profile vault personal-info form. */
export const USER_PROFILE_FORM_SELECT =
  "id, email, full_name, avatar_url, headline, location, phone, linkedin_url, github_url, website_url, plan, resumes_used, created_at, updated_at" as const;

export type UserProfileFormState = {
  fullName: string;
  headline: string;
  location: string;
  phone: string;
  linkedinUrl: string;
  githubUrl: string;
  websiteUrl: string;
};

export type UserProfileFormUpdate = Pick<
  UserProfile,
  | "full_name"
  | "headline"
  | "location"
  | "phone"
  | "linkedin_url"
  | "github_url"
  | "website_url"
  | "updated_at"
>;

export function mapRowToProfileFormState(
  row: UserProfile | null | undefined,
): UserProfileFormState {
  return {
    fullName: row?.full_name ?? "",
    headline: row?.headline ?? "",
    location: row?.location ?? "",
    phone: row?.phone ?? "",
    linkedinUrl: row?.linkedin_url ?? "",
    githubUrl: row?.github_url ?? "",
    websiteUrl: row?.website_url ?? "",
  };
}

/** Maps form state to `user_profiles` update/upsert keys (headline → headline). */
export function buildUserProfileUpdatePayload(
  form: UserProfileFormState,
): UserProfileFormUpdate {
  return {
    full_name: form.fullName.trim() || null,
    headline: form.headline.trim() || null,
    location: form.location.trim() || null,
    phone: form.phone.trim() || null,
    linkedin_url: form.linkedinUrl.trim() || null,
    github_url: form.githubUrl.trim() || null,
    website_url: form.websiteUrl.trim() || null,
    updated_at: new Date().toISOString(),
  };
}

export type UserProfileInsertDefaults = Pick<
  UserProfile,
  "plan" | "resumes_used"
>;

const DEFAULT_INSERT_DEFAULTS: UserProfileInsertDefaults = {
  plan: "free",
  resumes_used: 0,
};

export function buildUserProfileUpsertRow(
  userId: string,
  email: string,
  form: UserProfileFormState,
  existing?: UserProfileInsertDefaults | null,
): Database["public"]["Tables"]["user_profiles"]["Insert"] {
  const defaults = existing ?? DEFAULT_INSERT_DEFAULTS;

  return {
    id: userId,
    email,
    avatar_url: null,
    ...buildUserProfileUpdatePayload(form),
    plan: defaults.plan,
    resumes_used: defaults.resumes_used,
  };
}
