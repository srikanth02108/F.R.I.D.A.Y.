import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  AudioLines,
  Brain,
  Check,
  Infinity,
  Sparkles,
  Zap,
} from "lucide-react";

import { LandingNav } from "@/components/landing/landing-nav";
import { Button } from "@/components/ui/button";
import { BRAND_ACRONYM } from "@/lib/brand";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: `Pro Plan — ${BRAND_ACRONYM}`,
  description:
    "₹299/mo Pro tier with HR-optimized LLMs, unlimited resume versioning, live mock interview coaching, and real-time API integrations.",
};

const PRO_FEATURES = [
  {
    icon: Brain,
    title: "HR-optimized LLM models",
    description:
      "Fine-tuned, specialized language models engineered specifically for applicant tracking systems and recruiter parsing workflows.",
  },
  {
    icon: Infinity,
    title: "Infinite resume versioning",
    description:
      "Store unlimited tailored resume versions per role without caps — every iteration preserved in your secure vault.",
  },
  {
    icon: Sparkles,
    title: "Extended context windows",
    description:
      "High-frequency context models retain heavy job histories, multi-page experience blocks, and long JDs without truncation.",
  },
  {
    icon: Zap,
    title: "Real-time API integrations",
    description:
      "Connect live tailoring, ATS scoring, and generation pipelines with low-latency streaming across your workspace.",
  },
  {
    icon: AudioLines,
    title: "Live audio mock interview coach",
    description:
      "Interactive STAR coaching studio with AI interviewers trained on your target role — practice until you sound executive-ready.",
  },
] as const;

export default function ProPricingPage() {
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
          <span className="mb-4 inline-flex rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 font-mono text-xs font-semibold tracking-widest text-violet-600 uppercase dark:text-violet-300">
            Most Popular
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#0A0A0A] md:text-5xl dark:text-white">
            Pro Plan
          </h1>
          <p className="mt-3 flex items-baseline justify-center gap-1">
            <span className="text-5xl font-extrabold tabular-nums text-[#2055FD] dark:text-violet-400">
              ₹299
            </span>
            <span className="text-lg font-medium text-[#6B6B6B] dark:text-zinc-400">
              /month
            </span>
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-base text-[#6B6B6B] dark:text-zinc-400">
            Unlock the full {BRAND_ACRONYM} intelligence stack — built for
            professionals who need precision tailoring, unlimited versions, and
            interview-grade coaching on demand.
          </p>
        </div>

        <ul className="mb-12 space-y-4">
          {PRO_FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <li
                key={feature.title}
                className="flex gap-4 rounded-xl border border-[#e9e8e7] bg-white p-5 shadow-sm transition-all hover:border-[#2055FD]/30 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-violet-500/40"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#2055FD]/10 dark:bg-violet-500/15">
                  <Icon className="size-5 text-[#2055FD] dark:text-violet-400" />
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

        <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#2055FD]/20 bg-gradient-to-br from-[#0A0A0A] to-[#1a1a2e] p-8 text-center dark:border-violet-500/30 dark:from-zinc-900 dark:to-violet-950/40">
          <p className="max-w-lg text-sm text-slate-300">
            Checkout connects to your {BRAND_ACRONYM} workspace billing profile.
            Start Pro to immediately unlock advanced models and unlimited vault
            storage.
          </p>
          <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 font-semibold text-white shadow-md hover:brightness-110 sm:w-auto"
            >
              <Link href="/auth/signup">Start Pro Checkout</Link>
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
