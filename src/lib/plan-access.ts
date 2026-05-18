import type { Plan } from "@/types/database";

/** Gemini models used across the platform. */
export const GEMINI_FLASH_MODEL = "gemini-1.5-flash";
export const GEMINI_PRO_MODEL = "gemini-1.5-pro";

export type UserPlanSnapshot = {
  plan: Plan;
  resumes_used: number;
};

export const DEFAULT_PLAN_SNAPSHOT: UserPlanSnapshot = {
  plan: "free",
  resumes_used: 0,
};

/** Free users get 5, paid users are unlimited. */
export function getResumesLimit(plan: Plan): number {
  return hasPaidPlan(plan) ? Infinity : 5;
}

export function normalizePlan(value: string | null | undefined): Plan {
  if (value === "pro" || value === "team") return value;
  return "free";
}

export function hasPaidPlan(plan: Plan): boolean {
  return plan === "pro" || plan === "team";
}

export function canUseProModels(plan: Plan): boolean {
  return hasPaidPlan(plan);
}

export function canRunAiGeneration(snapshot: UserPlanSnapshot): boolean {
  if (hasPaidPlan(snapshot.plan)) return true;
  return snapshot.resumes_used < getResumesLimit(snapshot.plan);
}

/** Returns the Gemini model appropriate for the user's plan tier. */
export function getGeminiModelForPlan(plan: Plan): string {
  return canUseProModels(plan) ? GEMINI_PRO_MODEL : GEMINI_FLASH_MODEL;
}

export function getPlanSidebarLabel(snapshot: UserPlanSnapshot): string {
  const planName =
    snapshot.plan === "team"
      ? "Team Plan"
      : snapshot.plan === "pro"
        ? "Pro Plan"
        : "Free Plan";
  const limit = getResumesLimit(snapshot.plan);
  const limitStr = limit === Infinity ? "∞" : String(limit);
  return `${planName} · ${snapshot.resumes_used}/${limitStr} resumes`;
}

export function getMemberBadgeLabel(plan: Plan): string | null {
  if (plan === "team") return "Team Member";
  if (plan === "pro") return "Pro Member";
  return null;
}
