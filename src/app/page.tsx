import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LandingPage } from "@/components/landing/landing-page";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Tailor Your Resume — AI-Powered ATS Optimization System",
  description:
    "Dynamic resume customizer, real-time ATS keyword validator, and mock interview suite built for SummerSaaS Hackathon - 2026.",
};

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/app/dashboard");
  }

  return <LandingPage />;
}
