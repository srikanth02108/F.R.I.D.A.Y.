import Link from "next/link";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import {
  BarChart3,
  Check,
  Code2,
  KanbanSquare,
  Mic,
  Sparkles,
  Target,
} from "lucide-react";

import { AtsScoreDemo } from "@/components/landing/ats-score-demo";
import { HeroMockup } from "@/components/landing/hero-mockup";
import { LandingNav } from "@/components/landing/landing-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BRAND_ACRONYM,
  BRAND_SHORT,
  BRAND_SOCIAL,
} from "@/lib/brand";
import { cn } from "@/lib/utils";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-jetbrains-mono",
});

const SECTION = "mx-auto max-w-7xl px-4 sm:px-6";
const SECTION_PAD = "py-16 md:py-24 min-h-fit";

const STEPS = [
  {
    step: "01",
    title: "Build Your Profile",
    description:
      "Store your professional experience and technical skills securely in your personal vault just once.",
  },
  {
    step: "02",
    title: "Paste Any Job Description",
    description:
      "Our real-time AI engine tailors and aligns your experience metrics to the target role in seconds.",
  },
  {
    step: "03",
    title: "Get Interviewed",
    description:
      "Bypass ATS algorithmic filters with a 90+ optimization score, backed by an in-app interactive STAR coaching studio.",
  },
] as const;

const FEATURES = [
  {
    icon: Code2,
    title: "LaTeX Resume Editor",
    description:
      "Professional-grade formatting guaranteed to bypass ATS systems flawlessly.",
    accent: "azure" as const,
  },
  {
    icon: Sparkles,
    title: "AI Generator",
    description:
      "Generate impactful bullet points tailored to your specific industry experience.",
    accent: "azure" as const,
  },
  {
    icon: Target,
    title: "Job-Specific Tailoring",
    description:
      "Instantly adapt your master resume to match any job description perfectly.",
    accent: "azure" as const,
  },
  {
    icon: BarChart3,
    title: "ATS Score Tester",
    description:
      "Test your resume against proprietary algorithms to ensure maximum visibility.",
    accent: "emerald" as const,
  },
  {
    icon: Mic,
    title: "Interview Prep Suite",
    description:
      "Practice with AI interviewers trained on the specific role you're applying for.",
    accent: "azure" as const,
  },
  {
    icon: KanbanSquare,
    title: "Application Tracker",
    description:
      "Manage your entire job search pipeline from a single, organized dashboard.",
    accent: "azure" as const,
  },
] as const;

const PRICING = [
  {
    name: "Free",
    price: "₹0",
    period: "/mo",
    features: [
      "1 Master Resume",
      "Basic LaTeX Templates",
      "Standard ATS Checks",
    ],
    highlighted: false,
    cta: "Get Started",
    href: "/auth/signup",
    description:
      "Core access holding 3 tailored resumes per month, baseline ATS score checking, and 1 core layout template.",
  },
  {
    name: "Pro",
    price: "₹299",
    period: "/mo",
    features: [
      "Unlimited Resumes",
      "AI Bullet Generation",
      "Advanced ATS Insights",
      "Job-Specific Tailoring",
    ],
    highlighted: true,
    badge: "MOST POPULAR",
    cta: "Upgrade to Pro",
    href: "/pricing/pro",
    description:
      "Completely unlimited tailored resumes, full access to the AI interview suite, all premium templates, and advanced skills gap analyzers.",
  },
  {
    name: "Team",
    price: "₹999",
    period: "/mo",
    features: [
      "Everything in Pro",
      "Shared Templates",
      "Admin Dashboard",
      "Priority Support",
    ],
    highlighted: false,
    cta: "Contact Sales",
    href: "/pricing/team",
    description:
      "Tailored for placement cells, bootcamps, and career centers looking for bulk dashboard user control and administrative overview metrics.",
  },
] as const;

function FeatureCard({
  feature,
}: {
  feature: (typeof FEATURES)[number];
}) {
  const Icon = feature.icon;
  const isEmerald = feature.accent === "emerald";

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-[#e9e8e7] bg-white p-0 shadow-[0px_4px_20px_rgba(15,17,23,0.04)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-[#2055FD]/40 hover:shadow-xl hover:shadow-purple-500/5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-500/50 dark:hover:shadow-violet-500/10",
        isEmerald && "overflow-hidden",
      )}
    >
      {isEmerald ? (
        <div className="absolute -top-4 -right-4 size-24 rounded-bl-full bg-[#0EB87A]/10" />
      ) : null}
      <CardContent className="p-6 md:p-8">
        <div
          className={cn(
            "mb-5 flex size-12 items-center justify-center rounded-lg transition-colors",
            isEmerald
              ? "bg-[#0EB87A]/10"
              : "bg-[#f5f3f3] group-hover:bg-[#2055FD]/10 dark:bg-slate-800",
          )}
        >
          <Icon
            className={cn(
              "size-6",
              isEmerald ? "text-[#0EB87A]" : "text-[#2055FD] dark:text-violet-400",
            )}
          />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-[#1b1c1c] dark:text-white">
          {feature.title}
        </h3>
        <p className="text-sm leading-relaxed text-[#6B6B6B] dark:text-slate-400">
          {feature.description}
        </p>
      </CardContent>
    </Card>
  );
}

function PricingCard({ tier }: { tier: (typeof PRICING)[number] }) {
  const isPro = tier.highlighted;

  return (
    <Card
      className={cn(
        "relative flex h-full flex-col overflow-visible border-[#e9e8e7] bg-white shadow-[0px_4px_20px_rgba(15,17,23,0.04)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-violet-500/40 dark:hover:shadow-violet-500/10",
        isPro &&
          "z-10 border-[#2055FD] bg-[#0A0A0A] pt-2 shadow-xl md:scale-[1.03] dark:border-violet-500",
      )}
    >
      {"badge" in tier && tier.badge ? (
        <div className="absolute top-0 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <span className="inline-flex whitespace-nowrap rounded-full bg-[#2055FD] px-4 py-1.5 font-mono text-[11px] font-semibold tracking-wide text-white shadow-md ring-4 ring-[#fbf9f8] dark:bg-violet-600 dark:ring-zinc-950">
            {tier.badge}
          </span>
        </div>
      ) : null}
      <CardContent
        className={cn(
          "flex flex-1 flex-col p-6 md:p-8",
          isPro && "pt-8 md:pt-10",
        )}
      >
        <h3
          className={cn(
            "mb-2 text-2xl font-semibold",
            isPro ? "text-white" : "text-[#1b1c1c] dark:text-white",
          )}
        >
          {tier.name}
        </h3>
        <div className="mb-6 flex items-baseline gap-1">
          <span
            className={cn(
              "text-4xl font-extrabold tracking-tight tabular-nums sm:text-5xl",
              isPro ? "text-white" : "text-[#1b1c1c] dark:text-white",
            )}
          >
            {tier.price}
          </span>
          <span
            className={cn(
              "pb-0.5 text-sm font-medium leading-none",
              isPro ? "text-slate-400" : "text-[#6B6B6B] dark:text-slate-400",
            )}
          >
            {tier.period}
          </span>
        </div>
        <ul className="mb-8 flex-grow space-y-4">
          {tier.features.map((item) => (
            <li
              key={item}
              className={cn(
                "flex items-center gap-3 text-sm",
                isPro ? "text-white" : "text-[#1b1c1c] dark:text-slate-200",
              )}
            >
              <Check
                className={cn(
                  "size-4 shrink-0",
                  isPro ? "text-[#4fdf9d]" : "text-[#2055FD] dark:text-violet-400",
                )}
              />
              {item}
            </li>
          ))}
        </ul>
        <p
          className={cn(
            "mb-6 text-xs leading-relaxed",
            isPro ? "text-[#82838b]" : "text-[#6B6B6B] dark:text-slate-400",
          )}
        >
          {tier.description}
        </p>
        <Button
          asChild
          variant={isPro ? "default" : "outline"}
          className={cn(
            "w-full rounded-lg py-3 text-[15px] font-semibold",
            isPro
              ? "bg-[#2055FD] text-white hover:bg-[#2558ff] dark:bg-violet-600 dark:hover:bg-violet-500"
              : "border-[#e9e8e7] bg-transparent text-[#1b1c1c] hover:border-[#2055FD] hover:bg-[#f5f3f3] hover:text-[#2055FD] dark:border-slate-700 dark:text-white dark:hover:border-violet-500",
          )}
        >
          <Link href={"href" in tier && tier.href ? tier.href : "/auth/signup"}>
            {tier.cta}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

const socialIconClass = "size-5";

function SocialIconLinkedIn() {
  return (
    <svg
      className={socialIconClass}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function SocialIconGitHub() {
  return (
    <svg
      className={socialIconClass}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function SocialIconYouTube() {
  return (
    <svg
      className={socialIconClass}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function LandingFooter() {
  return (
    <footer
      className={cn(
        SECTION,
        "border-t border-[#e9e8e7] py-10 md:py-12 dark:border-slate-800",
      )}
    >
      <div className="flex flex-col items-center gap-8 text-center md:gap-6">
        <div className="space-y-1">
          <p className="text-2xl font-extrabold tracking-tight text-[#0A0A0A] dark:text-white">
            {BRAND_ACRONYM}
          </p>
          <p className="text-sm font-medium text-[#2055FD] dark:text-violet-400">
            {BRAND_SHORT}
          </p>
        </div>

        <p className="text-sm text-[#6B6B6B] dark:text-slate-400">
          Made with ❤️ for job seekers
        </p>

        <div className="flex items-center justify-center gap-4">
          <a
            href={BRAND_SOCIAL.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex size-10 items-center justify-center rounded-full border border-[#e9e8e7] text-[#46464b] transition-all hover:-translate-y-0.5 hover:border-[#2055FD] hover:bg-[#2055FD]/5 hover:text-[#2055FD] dark:border-slate-700 dark:text-slate-300 dark:hover:border-violet-500 dark:hover:bg-violet-500/10 dark:hover:text-violet-400"
            aria-label="F.R.I.D.A.Y. on LinkedIn"
          >
            <SocialIconLinkedIn />
          </a>
          <a
            href={BRAND_SOCIAL.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex size-10 items-center justify-center rounded-full border border-[#e9e8e7] text-[#46464b] transition-all hover:-translate-y-0.5 hover:border-[#2055FD] hover:bg-[#2055FD]/5 hover:text-[#2055FD] dark:border-slate-700 dark:text-slate-300 dark:hover:border-violet-500 dark:hover:bg-violet-500/10 dark:hover:text-violet-400"
            aria-label="F.R.I.D.A.Y. on GitHub"
          >
            <SocialIconGitHub />
          </a>
          <a
            href={BRAND_SOCIAL.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="flex size-10 items-center justify-center rounded-full border border-[#e9e8e7] text-[#46464b] transition-all hover:-translate-y-0.5 hover:border-[#2055FD] hover:bg-[#2055FD]/5 hover:text-[#2055FD] dark:border-slate-700 dark:text-slate-300 dark:hover:border-violet-500 dark:hover:bg-violet-500/10 dark:hover:text-violet-400"
            aria-label="F.R.I.D.A.Y. product demo on YouTube"
          >
            <SocialIconYouTube />
          </a>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div
      className={cn(
        plusJakarta.className,
        jetbrainsMono.variable,
        "flex min-h-full flex-col bg-[#fbf9f8] text-[#1b1c1c] antialiased dark:bg-[#0A0A0A] dark:text-slate-100",
        "bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] dark:bg-none",
      )}
    >
      <LandingNav />

      <main className="flex-1 pt-16 lg:pt-[4.5rem]">
        <section
          className={cn(
            SECTION,
            SECTION_PAD,
            "flex flex-col items-center text-center",
          )}
        >
          <span className="mb-5 inline-flex rounded-full border border-[#2055FD]/20 bg-[#2055FD]/10 px-3 py-1 font-mono text-[13px] font-medium tracking-[0.05em] text-[#2055FD] dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300">
            Built for SummerSaaS Hackathon 2026
          </span>

          <h1 className="mx-auto mb-5 max-w-4xl text-4xl font-extrabold tracking-[-0.02em] text-[#1b1c1c] sm:text-5xl md:text-[44px] md:leading-[52px] dark:text-white">
            Your Resume, Tailored for Every Job. In 30 Seconds.
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-[#6B6B6B] md:text-lg md:leading-7 dark:text-slate-400">
            Precision LaTeX career engineering from{" "}
            <span className="font-semibold text-[#0A0A0A] dark:text-white">
              {BRAND_ACRONYM}
            </span>{" "}
            — built for ambitious professionals targeting top corporate roles.
          </p>

          <div className="mb-12 flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center">
            <Button
              size="lg"
              asChild
              className="h-12 rounded-lg bg-[#0A0A0A] px-8 text-[15px] font-semibold text-white shadow-[0px_4px_20px_rgba(15,17,23,0.04)] hover:bg-[#5d5e65] dark:bg-violet-600 dark:hover:bg-violet-500"
            >
              <Link href="/auth/signup">Start for Free</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-12 rounded-lg border-[#e9e8e7] bg-white px-8 text-[15px] font-semibold text-[#1b1c1c] hover:border-[#2055FD] hover:bg-white hover:text-[#2055FD] dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-violet-500"
            >
              <a href="#ats-score">View Demo</a>
            </Button>
          </div>

          <HeroMockup />
        </section>

        <section
          id="how-it-works"
          className={cn(
            "scroll-mt-28 border-y border-[#e9e8e7] bg-white dark:border-slate-800 dark:bg-slate-950",
            SECTION_PAD,
          )}
        >
          <div className={SECTION}>
            <div className="mb-12 text-center md:mb-14">
              <h2 className="text-3xl font-bold tracking-tight text-[#1b1c1c] md:text-[32px] md:leading-10 dark:text-white">
                How it works
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-base text-[#6B6B6B] dark:text-slate-400">
                Three steps from one profile to interview-ready — built for
                India&apos;s competitive hiring market.
              </p>
            </div>

            <div className="flex flex-col gap-10 md:gap-12">
              {STEPS.map((item) => (
                <div
                  key={item.step}
                  className="flex items-start gap-5 sm:gap-8 md:gap-10"
                >
                  <span
                    className="shrink-0 font-mono text-4xl font-extrabold leading-none tracking-tight text-[#2055FD]/25 sm:text-5xl md:text-6xl dark:text-violet-500/30"
                    aria-hidden
                  >
                    {item.step}
                  </span>
                  <div className="min-w-0 pt-1 text-left">
                    <h3 className="text-xl font-semibold text-[#1b1c1c] dark:text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6B6B6B] sm:text-base dark:text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="features"
          className={cn(
            "scroll-mt-28 border-b border-[#e9e8e7] bg-white dark:border-slate-800 dark:bg-slate-950",
            SECTION_PAD,
          )}
        >
          <div className={SECTION}>
            <div className="mb-12 text-center md:mb-14">
              <h2 className="mb-3 text-3xl font-bold tracking-tight text-[#1b1c1c] md:text-[32px] md:leading-10 dark:text-white">
                Everything you need to land the role
              </h2>
              <p className="text-base text-[#6B6B6B] dark:text-slate-400">
                A comprehensive suite of tools engineered for the modern job
                seeker.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <FeatureCard key={feature.title} feature={feature} />
              ))}
            </div>
          </div>
        </section>

        <AtsScoreDemo />

        <section
          id="pricing"
          className={cn("scroll-mt-28", SECTION_PAD)}
        >
          <div className={SECTION}>
            <div className="mb-12 text-center md:mb-14">
              <h2 className="mb-3 text-3xl font-bold tracking-tight text-[#1b1c1c] md:text-[32px] md:leading-10 dark:text-white">
                Simple, Transparent Pricing
              </h2>
              <p className="text-base text-[#6B6B6B] dark:text-slate-400">
                Invest in your career trajectory with plans built for every
                stage.
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl grid-cols-1 items-stretch gap-6 md:grid-cols-3 md:gap-8">
              {PRICING.map((tier) => (
                <PricingCard key={tier.name} tier={tier} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
