import type { Plan } from "@/types/database";

export const PRO_GROQ_MODEL = "llama-3.3-70b-versatile";
export const FREE_GROQ_MODEL = "llama-3.1-8b-instant";

export type UserPlanSnapshot = {
  plan: Plan;
  resumes_used: number;
  resumes_limit: number;
};

export const DEFAULT_PLAN_SNAPSHOT: UserPlanSnapshot = {
  plan: "free",
  resumes_used: 0,
  resumes_limit: 5,
};

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
  return snapshot.resumes_used < snapshot.resumes_limit;
}

export function canViewProDashboardMetrics(plan: Plan): boolean {
  return hasPaidPlan(plan);
}

export function getGroqModelForPlan(plan: Plan): string {
  return canUseProModels(plan) ? PRO_GROQ_MODEL : FREE_GROQ_MODEL;
}

export function getPlanSidebarLabel(snapshot: UserPlanSnapshot): string {
  const planName =
    snapshot.plan === "team"
      ? "Team Plan"
      : snapshot.plan === "pro"
        ? "Pro Plan"
        : "Free Plan";
  return `${planName} · ${snapshot.resumes_used}/${snapshot.resumes_limit} resumes`;
}

export function getMemberBadgeLabel(plan: Plan): string | null {
  if (plan === "team") return "Team Member";
  if (plan === "pro") return "Pro Member";
  return null;
}
