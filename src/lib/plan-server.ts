import { NextResponse } from "next/server";

import {
  canRunAiGeneration,
  canUseProModels,
  DEFAULT_PLAN_SNAPSHOT,
  normalizePlan,
  type UserPlanSnapshot,
} from "@/lib/plan-access";
import { createClient } from "@/lib/supabase/server";

export async function fetchUserPlanSnapshot(
  userId: string,
): Promise<UserPlanSnapshot> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("plan, resumes_used, resumes_limit")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return DEFAULT_PLAN_SNAPSHOT;
  }

  return {
    plan: normalizePlan(data.plan),
    resumes_used: data.resumes_used ?? DEFAULT_PLAN_SNAPSHOT.resumes_used,
    resumes_limit: data.resumes_limit ?? DEFAULT_PLAN_SNAPSHOT.resumes_limit,
  };
}

type AuthPlanResult =
  | { ok: true; userId: string; snapshot: UserPlanSnapshot }
  | { ok: false; response: NextResponse };

export async function getAuthenticatedUserPlan(): Promise<AuthPlanResult> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const snapshot = await fetchUserPlanSnapshot(user.id);
  return { ok: true, userId: user.id, snapshot };
}

export function aiGenerationBlockedResponse(): NextResponse {
  return NextResponse.json(
    {
      error:
        "You have reached your free generation limit. Upgrade to Pro for unlimited AI generations.",
    },
    { status: 403 },
  );
}

export function proModelsBlockedResponse(): NextResponse {
  return NextResponse.json(
    {
      error:
        "This feature uses Pro-only AI models. Upgrade to Pro or Team to unlock advanced models.",
    },
    { status: 403 },
  );
}

export function assertAiGenerationAllowed(
  snapshot: UserPlanSnapshot,
): NextResponse | null {
  if (!canRunAiGeneration(snapshot)) {
    return aiGenerationBlockedResponse();
  }
  return null;
}

export function assertProModelsAllowed(
  snapshot: UserPlanSnapshot,
): NextResponse | null {
  if (!canUseProModels(snapshot.plan)) {
    return proModelsBlockedResponse();
  }
  return null;
}
