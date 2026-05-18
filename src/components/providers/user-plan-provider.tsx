"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  canRunAiGeneration,
  canUseProModels,
  canViewProDashboardMetrics,
  DEFAULT_PLAN_SNAPSHOT,
  normalizePlan,
  type UserPlanSnapshot,
} from "@/lib/plan-access";
import { createClient } from "@/lib/supabase/client";
import type { Plan } from "@/types/database";

type UserPlanContextValue = {
  snapshot: UserPlanSnapshot;
  loading: boolean;
  refresh: () => Promise<void>;
  isPaid: boolean;
  canUseProModels: boolean;
  canRunAiGeneration: boolean;
  canViewProDashboardMetrics: boolean;
};

const UserPlanContext = createContext<UserPlanContextValue | null>(null);

async function loadPlanFromClient(): Promise<UserPlanSnapshot> {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return DEFAULT_PLAN_SNAPSHOT;
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .select("plan, resumes_used, resumes_limit")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    return DEFAULT_PLAN_SNAPSHOT;
  }

  return {
    plan: normalizePlan(data.plan as Plan | string),
    resumes_used: data.resumes_used ?? 0,
    resumes_limit: data.resumes_limit ?? 5,
  };
}

export function UserPlanProvider({
  initialSnapshot,
  children,
}: {
  initialSnapshot: UserPlanSnapshot | null;
  children: React.ReactNode;
}) {
  const [snapshot, setSnapshot] = useState<UserPlanSnapshot>(
    initialSnapshot ?? DEFAULT_PLAN_SNAPSHOT,
  );
  const [loading, setLoading] = useState(!initialSnapshot);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const next = await loadPlanFromClient();
      setSnapshot(next);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refresh();
    });

    if (!initialSnapshot) {
      void refresh();
    }

    return () => subscription.unsubscribe();
  }, [initialSnapshot, refresh]);

  const value = useMemo<UserPlanContextValue>(() => {
    const isPaid = snapshot.plan === "pro" || snapshot.plan === "team";
    return {
      snapshot,
      loading,
      refresh,
      isPaid,
      canUseProModels: canUseProModels(snapshot.plan),
      canRunAiGeneration: canRunAiGeneration(snapshot),
      canViewProDashboardMetrics: canViewProDashboardMetrics(snapshot.plan),
    };
  }, [snapshot, loading, refresh]);

  return (
    <UserPlanContext.Provider value={value}>{children}</UserPlanContext.Provider>
  );
}

export function useUserPlan(): UserPlanContextValue {
  const context = useContext(UserPlanContext);
  if (!context) {
    throw new Error("useUserPlan must be used within UserPlanProvider");
  }
  return context;
}
