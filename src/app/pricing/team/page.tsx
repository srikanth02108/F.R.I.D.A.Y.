import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Check,
  LayoutDashboard,
  Share2,
  Users,
  Zap,
} from "lucide-react";

import { LandingNav } from "@/components/landing/landing-nav";
import { Button } from "@/components/ui/button";
import { BRAND_ACRONYM } from "@/lib/brand";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: `Team Plan — ${BRAND_ACRONYM}`,
  description:
    "₹999/mo Team tier for placement departments and career agencies — multi-user dashboards, bulk analytics, shared templates, and priority generation lanes.",
};

const TEAM_FEATURES = [
  {
    icon: Users,
    title: "Multi-user unified dashboards",
    description:
      "Purpose-built for university placement cells and career counseling agencies — manage cohorts, advisors, and candidates from one command center.",
  },
  {
    icon: BarChart3,
    title: "Bulk analytical reporting pools",
    description:
      "Aggregate ATS lift metrics, tailoring velocity, and interview readiness scores across hundreds of students with exportable insight layers.",
  },
  {
    icon: LayoutDashboard,
    title: "Custom administrative controls",
    description:
      "Role-based permissions, advisor assignments, template governance, and org-wide policy settings for institutional compliance.",
  },
  {
    icon: Share2,
    title: "Shared template design vaults",
    description:
      "Distribute approved LaTeX layouts, branding kits, and section schemas across your entire organization instantly.",
  },
  {
    icon: Zap,
    title: "Dedicated throughput model lanes",
    description:
      "Priority generation queues deliver instant tailoring and interview responses without wait times — even during peak campus hiring season.",
  },
] as const;

export default function TeamPricingPage() {
  return (
    <div
      className={cn(
        "min-h-screen bg-[#fbf9f8] text-[#1b1c1c] dark:bg-zinc-950 dark:text-zinc-50",
        "bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] dark:bg-none",
      )}
    >
      <LandingNav />

      <main className="mx-auto max-w-4xl px-4 pb-20 pt-28 sm:px-6">
        <Link
          href="/#pricing"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#6B6B6B] transition-colors hover:text-[#2055FD] hover:underline dark:text-zinc-400 dark:hover:text-violet-400"
        >
          <ArrowLeft className="size-4" />
          Back to pricing
        </Link>

        <div className="mb-10 text-center">
          <span className="mb-4 inline-flex rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 font-mono text-xs font-semibold tracking-widest text-indigo-600 uppercase dark:text-indigo-300">
            Institutions & Agencies
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#0A0A0A] md:text-5xl dark:text-white">
            Team Plan
          </h1>
          <p className="mt-3 flex items-baseline justify-center gap-1">
            <span className="text-5xl font-extrabold tabular-nums text-indigo-600 dark:text-indigo-400">
              ₹999
            </span>
            <span className="text-lg font-medium text-[#6B6B6B] dark:text-zinc-400">
              /month
            </span>
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-base text-[#6B6B6B] dark:text-zinc-400">
            Scale {BRAND_ACRONYM} across your entire organization with enterprise
            controls, shared assets, and guaranteed high-throughput AI lanes.
          </p>
        </div>

        <ul className="mb-12 space-y-4">
          {TEAM_FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <li
                key={feature.title}
                className="flex gap-4 rounded-xl border border-[#e9e8e7] bg-white p-5 shadow-sm transition-all hover:border-indigo-500/30 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-500/40"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10">
                  <Icon className="size-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-[#0A0A0A] dark:text-white">
                    {feature.title}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-[#6B6B6B] dark:text-zinc-400">
                    {feature.description}
                  </p>
                </div>
                <Check className="mt-1 size-5 shrink-0 text-[#0EB87A]" />
              </li>
            );
          })}
        </ul>

        <div className="flex flex-col items-center gap-4 rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 p-8 text-center">
          <p className="max-w-lg text-sm text-slate-300">
            Contact our team to provision seats, configure admin roles, and
            activate dedicated model throughput for your institution.
          </p>
          <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 font-semibold text-white shadow-md hover:brightness-110 sm:w-auto"
            >
              <Link href="/auth/signup">Request Team Access</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
            >
              <Link href="/app/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
