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
        "group relative overflow-hidden border-[#e9e8e7] bg-white p-0 shadow-[0px_4px_20px_rgba(15,17,23,0.04)] transition-all hover:border-[#2055FD] hover:shadow-lg",
        isEmerald && "overflow-hidden",
      )}
    >
      {isEmerald ? (
        <div className="absolute -top-4 -right-4 size-24 rounded-bl-full bg-[#0EB87A]/10" />
      ) : null}
      <CardContent className="p-8">
        <div
          className={cn(
            "mb-6 flex size-12 items-center justify-center rounded-lg transition-colors",
            isEmerald
              ? "bg-[#0EB87A]/10"
              : "bg-[#f5f3f3] group-hover:bg-[#2055FD]/10",
          )}
        >
          <Icon
            className={cn(
              "size-6",
              isEmerald ? "text-[#0EB87A]" : "text-[#2055FD]",
            )}
          />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-[#1b1c1c]">
          {feature.title}
        </h3>
        <p className="text-sm leading-relaxed text-[#6B6B6B]">
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
        "relative flex h-full flex-col border-[#e9e8e7] bg-white shadow-[0px_4px_20px_rgba(15,17,23,0.04)]",
        isPro &&
          "z-10 scale-100 border-[#2055FD] bg-[#0A0A0A] shadow-xl md:scale-105",
      )}
    >
      {"badge" in tier && tier.badge ? (
        <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2055FD] px-3 py-1 font-mono text-xs font-medium text-white">
          {tier.badge}
        </span>
      ) : null}
      <CardContent className="flex flex-1 flex-col p-8">
        <h3
          className={cn(
            "mb-2 text-2xl font-semibold",
            isPro ? "text-white" : "text-[#1b1c1c]",
          )}
        >
          {tier.name}
        </h3>
        <div className="mb-6">
          <span
            className={cn(
              "text-5xl font-extrabold tracking-tight",
              isPro ? "text-white" : "text-[#1b1c1c]",
            )}
          >
            {tier.price}
          </span>
          <span
            className={cn(
              "text-sm",
              isPro ? "text-[#6B6B6B]" : "text-[#6B6B6B]",
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
                isPro ? "text-white" : "text-[#1b1c1c]",
              )}
            >
              <Check
                className={cn(
                  "size-4 shrink-0",
                  isPro ? "text-[#4fdf9d]" : "text-[#2055FD]",
                )}
              />
              {item}
            </li>
          ))}
        </ul>
        <p
          className={cn(
            "mb-6 text-xs leading-relaxed",
            isPro ? "text-[#82838b]" : "text-[#6B6B6B]",
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
              ? "bg-[#2055FD] text-white hover:bg-[#2558ff]"
              : "border-[#e9e8e7] bg-transparent text-[#1b1c1c] hover:border-[#2055FD] hover:bg-[#f5f3f3] hover:text-[#2055FD]",
          )}
        >
          <Link href="/auth/signup">{tier.cta}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function LandingPage() {
  return (
    <div
      className={cn(
        plusJakarta.className,
        jetbrainsMono.variable,
        "flex min-h-full flex-col bg-[#fbf9f8] text-[#1b1c1c] antialiased",
      )}
    >
      <LandingNav />

      <main className="flex-1 pt-16 lg:pt-20">
        <section className="mx-auto flex max-w-[1280px] flex-col items-center px-4 py-16 text-center sm:px-6 md:px-10 md:py-24">
          <span className="mb-6 inline-flex rounded-full border border-[#2055FD]/20 bg-[#2055FD]/10 px-3 py-1 font-mono text-[13px] font-medium tracking-[0.05em] text-[#2055FD]">
            Built for SummerSaaS Hackathon 2026
          </span>

          <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-extrabold tracking-[-0.02em] text-[#1b1c1c] sm:text-5xl md:text-[48px] md:leading-[56px]">
            Your Resume, Tailored for Every Job. In 30 Seconds.
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-7 text-[#6B6B6B] md:text-[18px] md:leading-[28px]">
            Precision LaTeX career engineering designed specifically for
            ambitious Indian professionals aiming for top corporate roles.
          </p>

          <div className="mb-16 flex w-full max-w-md flex-col items-stretch justify-center gap-4 sm:max-w-none sm:flex-row sm:items-center">
            <Button
              size="lg"
              asChild
              className="h-12 rounded-lg bg-[#0A0A0A] px-8 text-[15px] font-semibold text-white shadow-[0px_4px_20px_rgba(15,17,23,0.04)] hover:bg-[#5d5e65]"
            >
              <Link href="/auth/signup">Start for Free</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-12 rounded-lg border-[#e9e8e7] bg-white px-8 text-[15px] font-semibold text-[#1b1c1c] hover:border-[#2055FD] hover:bg-white hover:text-[#2055FD]"
            >
              <a href="#ats-score">View Demo</a>
            </Button>
          </div>

          <HeroMockup />
        </section>

        <section
          id="how-it-works"
          className="scroll-mt-28 border-y border-[#e9e8e7] bg-white px-4 py-20 sm:px-6 md:px-10"
        >
          <div className="mx-auto max-w-[1280px]">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-[#1b1c1c] md:text-[32px] md:leading-10">
                How it works
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-[#6B6B6B]">
                Three steps from one profile to interview-ready — built for
                India&apos;s competitive hiring market.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {STEPS.map((item, index) => (
                <div key={item.step} className="relative md:text-left">
                  {index < STEPS.length - 1 ? (
                    <span
                      className="absolute top-8 left-[1.125rem] hidden h-[calc(100%+2rem)] w-px bg-[#6B6B6B]/25 md:block"
                      aria-hidden
                    />
                  ) : null}
                  <span className="inline-flex size-9 items-center justify-center rounded-full bg-[#2055FD]/10 font-mono text-sm font-bold text-[#2055FD]">
                    {item.step}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold text-[#1b1c1c]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#6B6B6B]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="features"
          className="scroll-mt-28 border-b border-[#e9e8e7] bg-white py-20"
        >
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 md:px-10">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-[#1b1c1c] md:text-[32px] md:leading-10">
                Everything you need to land the role
              </h2>
              <p className="text-base text-[#6B6B6B]">
                A comprehensive suite of tools engineered for the modern job
                seeker.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <FeatureCard key={feature.title} feature={feature} />
              ))}
            </div>
          </div>
        </section>

        <AtsScoreDemo />

        <section
          id="pricing"
          className="scroll-mt-28 px-4 py-20 sm:px-6 md:px-10"
        >
          <div className="mx-auto max-w-[1280px]">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-[#1b1c1c] md:text-[32px] md:leading-10">
                Simple, Transparent Pricing
              </h2>
              <p className="text-base text-[#6B6B6B]">
                Invest in your career trajectory with plans built for every
                stage.
              </p>
            </div>

            <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-8 md:grid-cols-3">
              {PRICING.map((tier) => (
                <PricingCard key={tier.name} tier={tier} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-16 flex w-full flex-col items-center justify-between gap-6 border-t border-[#e9e8e7] bg-[#fbf9f8] px-4 py-8 sm:flex-row sm:px-6 md:px-10">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-[#0A0A0A]">TYR</span>
            <span className="hidden border-l border-[#e9e8e7] pl-4 text-sm text-[#6B6B6B] md:inline">
              © 2024 Tailor Your Resume (TYR). Precision LaTeX Career
              Engineering.
            </span>
          </div>
          <p className="text-center text-sm text-[#6B6B6B] md:hidden">
            © 2024 Tailor Your Resume (TYR). Precision LaTeX Career Engineering.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <Link
            href="#features"
            className="text-sm text-[#6B6B6B] transition-colors hover:text-[#2055FD] hover:underline"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm text-[#6B6B6B] transition-colors hover:text-[#2055FD] hover:underline"
          >
            How It Works
          </Link>
          <Link
            href="#pricing"
            className="text-sm text-[#6B6B6B] transition-colors hover:text-[#2055FD] hover:underline"
          >
            Pricing
          </Link>
          <Link
            href="/auth/login"
            className="text-sm text-[#6B6B6B] transition-colors hover:text-[#2055FD] hover:underline"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="text-sm text-[#6B6B6B] transition-colors hover:text-[#2055FD] hover:underline"
          >
            Sign Up
          </Link>
        </div>
        <p className="hidden text-xs font-medium text-[#6B6B6B] lg:block">
          Engineered with Llama 3.3 70B via Groq Architecture
        </p>
      </footer>
    </div>
  );
}
