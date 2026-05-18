import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LandingPage } from "@/components/landing/landing-page";
import { BRAND_FULL_NAME } from "@/lib/brand";
import { fetchUserPlanSnapshot } from "@/lib/plan-server";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: `${BRAND_FULL_NAME} — AI-Powered ATS Optimization`,
  description:
    "Flexible Resume & Interview Optimizer for a Dynamic Adaptation System — dynamic resume customizer, ATS keyword validator, and mock interview suite.",
};

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await fetchUserPlanSnapshot(user.id);
    redirect("/app/dashboard");
  }

  return <LandingPage />;
}
