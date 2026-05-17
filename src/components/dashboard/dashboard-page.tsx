"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import {
  BarChart3,
  Briefcase,
  CalendarCheck,
  FileText,
  Lightbulb,
  ListChecks,
  Pencil,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Resume } from "@/types/database";

const PROFILE_VAULT_SLUG = "profile-vault";

type DashboardMetrics = {
  resumesCreated: number;
  jobsApplied: number;
  avgAtsScore: number | null;
  interviewsScheduled: number;
};

type RecentResume = {
  id: string;
  name: string;
  template: string;
  modified: Date;
  atsScore: number | null;
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const quickActions = [
  {
    title: "Generate Resume with AI",
    description: "Create a polished resume in minutes with AI assistance",
    href: "/app/generate",
    icon: Sparkles,
    gradient: "from-violet-600 to-purple-700",
    hover: "hover:from-violet-700 hover:to-purple-800",
  },
  {
    title: "Tailor for a Job",
    description: "Match your resume to a specific job description",
    href: "/app/tailor",
    icon: Target,
    gradient: "from-blue-600 to-cyan-600",
    hover: "hover:from-blue-700 hover:to-cyan-700",
  },
  {
    title: "Test ATS Score",
    description: "See how well your resume passes applicant tracking systems",
    href: "/app/ats-score",
    icon: BarChart3,
    gradient: "from-emerald-600 to-teal-600",
    hover: "hover:from-emerald-700 hover:to-teal-700",
  },
] as const;

const tips = [
  {
    title: "Lead with impact",
    description:
      "Start bullet points with strong action verbs and quantify results whenever possible.",
    icon: Zap,
    iconClass: "bg-violet-100 text-violet-600",
  },
  {
    title: "Match keywords",
    description:
      "Mirror important skills and phrases from the job posting to improve ATS compatibility.",
    icon: ListChecks,
    iconClass: "bg-blue-100 text-blue-600",
  },
  {
    title: "Keep it scannable",
    description:
      "Use clear headings, consistent formatting, and one page when you have under 10 years of experience.",
    icon: Lightbulb,
    iconClass: "bg-amber-100 text-amber-600",
  },
] as const;

function atsBadgeClass(score: number | null) {
  if (score === null) return "bg-slate-100 text-slate-600";
  if (score >= 80) return "bg-emerald-100 text-emerald-700";
  if (score >= 60) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

function MetricValue({
  loading,
  value,
  formatValue,
}: {
  loading: boolean;
  value: number | null;
  formatValue?: (v: number) => string;
}) {
  if (loading) {
    return <Skeleton className="h-8 w-14 rounded-md" />;
  }

  if (value === null) {
    return <p className="text-2xl font-semibold tabular-nums text-slate-900">—</p>;
  }

  return (
    <p className="text-2xl font-semibold tabular-nums text-slate-900">
      {formatValue ? formatValue(value) : value}
    </p>
  );
}

export function DashboardPage() {
  const router = useRouter();
  const today = format(new Date(), "EEEE, MMMM d, yyyy");

  const [metricsLoading, setMetricsLoading] = useState(true);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    resumesCreated: 0,
    jobsApplied: 0,
    avgAtsScore: null,
    interviewsScheduled: 0,
  });
  const [recentResumes, setRecentResumes] = useState<RecentResume[]>([]);

  const loadDashboardData = useCallback(async () => {
    setMetricsLoading(true);
    setResumesLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setMetrics({
          resumesCreated: 0,
          jobsApplied: 0,
          avgAtsScore: null,
          interviewsScheduled: 0,
        });
        setRecentResumes([]);
        return;
      }

      const [resumesResult, applicationsResult] = await Promise.all([
        supabase
          .from("resumes")
          .select("id, title, template, ats_score, updated_at, slug")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false }),
        supabase
          .from("job_applications")
          .select("status")
          .eq("user_id", user.id),
      ]);

      const resumeRows = (resumesResult.data ?? []) as Pick<
        Resume,
        "id" | "title" | "template" | "ats_score" | "updated_at" | "slug"
      >[];

      const visibleResumes = resumeRows.filter(
        (row) => row.slug !== PROFILE_VAULT_SLUG,
      );

      const scores = visibleResumes
        .map((row) => row.ats_score)
        .filter((score): score is number => typeof score === "number");

      const avgAtsScore =
        scores.length > 0
          ? Math.round(
              scores.reduce((sum, score) => sum + score, 0) / scores.length,
            )
          : null;

      const applicationRows = applicationsResult.data ?? [];
      const jobsApplied = applicationRows.filter(
        (row) => row.status !== "saved",
      ).length;
      const interviewsScheduled = applicationRows.filter(
        (row) => row.status === "interview",
      ).length;

      setMetrics({
        resumesCreated: visibleResumes.length,
        jobsApplied,
        avgAtsScore,
        interviewsScheduled,
      });

      setRecentResumes(
        visibleResumes.slice(0, 3).map((row) => ({
          id: row.id,
          name: row.title,
          template: row.template,
          modified: new Date(row.updated_at),
          atsScore: row.ats_score,
        })),
      );
    } catch (error) {
      console.error("[Dashboard] Failed to load analytics", error);
      setMetrics({
        resumesCreated: 0,
        jobsApplied: 0,
        avgAtsScore: null,
        interviewsScheduled: 0,
      });
      setRecentResumes([]);
    } finally {
      setMetricsLoading(false);
      setResumesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  const statCards = [
    {
      label: "Resumes Created",
      value: metrics.resumesCreated,
      icon: FileText,
      iconClass: "bg-violet-100 text-violet-600",
      format: undefined,
    },
    {
      label: "Jobs Applied",
      value: metrics.jobsApplied,
      icon: Briefcase,
      iconClass: "bg-blue-100 text-blue-600",
      format: undefined,
    },
    {
      label: "Avg ATS Score",
      value: metrics.avgAtsScore,
      icon: TrendingUp,
      iconClass: "bg-emerald-100 text-emerald-600",
      format: (v: number) => `${v}%`,
    },
    {
      label: "Interviews Scheduled",
      value: metrics.interviewsScheduled,
      icon: CalendarCheck,
      iconClass: "bg-amber-100 text-amber-600",
      format: undefined,
    },
  ] as const;

  return (
    <>
      <div className="relative mx-auto h-full w-full max-w-6xl space-y-8 overflow-y-auto px-6 py-8 pb-24 lg:px-8">
        <header>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            {getGreeting()}! Ready to land your next job?
          </h2>
          <p className="mt-1 text-sm text-slate-500">{today}</p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="shadow-sm">
                <CardContent className="flex items-center gap-4">
                  <div
                    className={cn(
                      "flex size-11 shrink-0 items-center justify-center rounded-lg",
                      stat.iconClass,
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <MetricValue
                      loading={metricsLoading}
                      value={stat.value}
                      formatValue={stat.format}
                    />
                    <p className="text-sm text-slate-500">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Quick Actions
            </h3>
            <p className="text-sm text-slate-500">
              Jump straight into what matters most
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href} className="group">
                  <Card
                    className={cn(
                      "h-full border-0 bg-gradient-to-br text-white shadow-md transition-all",
                      action.gradient,
                      action.hover,
                      "group-hover:-translate-y-0.5 group-hover:shadow-lg",
                    )}
                  >
                    <CardContent className="flex h-full flex-col gap-4 pt-1">
                      <div className="flex size-11 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                        <Icon className="size-6" />
                      </div>
                      <div>
                        <p className="text-base font-semibold">{action.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-white/80">
                          {action.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Recent Resumes
              </h3>
              <p className="text-sm text-slate-500">
                Pick up where you left off
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/app/editor">View all</Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resumesLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="shadow-sm">
                  <CardContent className="space-y-3 pt-6">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : recentResumes.length === 0 ? (
              <Card className="md:col-span-2 lg:col-span-3">
                <CardContent className="py-10 text-center text-sm text-slate-500">
                  No resumes yet.{" "}
                  <button
                    type="button"
                    className="font-medium text-violet-600 hover:underline"
                    onClick={() => router.push("/app/generate")}
                  >
                    Generate your first resume
                  </button>
                </CardContent>
              </Card>
            ) : (
              recentResumes.map((resume) => (
                <Card
                  key={resume.id}
                  className="shadow-sm transition-shadow hover:shadow-md"
                >
                  <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
                    <div className="min-w-0 flex-1 space-y-1">
                      <CardTitle className="truncate text-slate-900">
                        {resume.name}
                      </CardTitle>
                      <CardDescription className="capitalize">
                        {resume.template}
                      </CardDescription>
                    </div>
                    <Badge
                      className={cn(
                        "shrink-0 border-0 font-medium",
                        atsBadgeClass(resume.atsScore),
                      )}
                    >
                      ATS {resume.atsScore ?? "—"}
                    </Badge>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between pt-0">
                    <p className="text-xs text-slate-500">
                      Modified {format(resume.modified, "MMM d, yyyy")}
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/app/editor?id=${resume.id}`}>
                        <Pencil className="size-3.5" />
                        Edit
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Pro Tips for a Better Resume
            </h3>
            <p className="text-sm text-slate-500">
              Small changes that make a big difference
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {tips.map((tip) => {
              const Icon = tip.icon;
              return (
                <Card key={tip.title} className="shadow-sm">
                  <CardContent className="space-y-3">
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-lg",
                        tip.iconClass,
                      )}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{tip.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-500">
                        {tip.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>

      <Button
        type="button"
        onClick={() => router.push("/app/generate")}
        className={cn(
          "group fixed bottom-6 right-6 z-50 h-14 gap-0 overflow-hidden rounded-full",
          "bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600",
          "px-4 text-white shadow-lg shadow-violet-500/40",
          "animate-pulse hover:animate-none hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700",
          "transition-all duration-300 hover:gap-2 hover:pr-5",
        )}
        aria-label="Quick Tailor AI"
      >
        <Sparkles className="size-5 shrink-0" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold opacity-0 transition-all duration-300 group-hover:max-w-[8rem] group-hover:opacity-100">
          Quick Tailor AI
        </span>
      </Button>
    </>
  );
}
