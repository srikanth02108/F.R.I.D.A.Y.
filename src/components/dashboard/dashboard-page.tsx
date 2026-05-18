"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  ArrowUp,
  BadgeCheck,
  Download,
  FileText,
  Lightbulb,
  Mail,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  pipelineApplied: number;
  pipelineInterviewing: number;
  pipelineOffers: number;
};

type RecentResume = {
  id: string;
  name: string;
  template: string;
  modified: Date;
  atsScore: number | null;
};

type ActivityItem = {
  id: string;
  title: string;
  timestamp: Date;
  accent: "azure" | "muted";
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getProfileStrengthGrade(
  avgAts: number | null,
  resumeCount: number,
): string {
  if (resumeCount === 0) return "—";
  if (avgAts === null) return "B";
  if (avgAts >= 90) return "A";
  if (avgAts >= 85) return "A-";
  if (avgAts >= 75) return "B+";
  if (avgAts >= 65) return "B";
  return "C+";
}

function getResumeBadge(
  index: number,
  atsScore: number | null,
): { label: string; variant: "master" | "tailored" | "draft" } {
  if (index === 0) {
    return { label: "MASTER", variant: "master" };
  }
  if (typeof atsScore === "number" && atsScore >= 70) {
    return { label: "TAILORED", variant: "tailored" };
  }
  return { label: "DRAFT", variant: "draft" };
}

function SectionLabel({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <h3 className="mb-2 flex items-center gap-2 font-mono text-[13px] font-medium tracking-wider text-[#6B6B6B] uppercase">
      {Icon ? <Icon className="size-4 text-[#2055FD]" /> : null}
      {children}
    </h3>
  );
}

function MetricValue({
  loading,
  value,
  formatValue,
  className,
}: {
  loading: boolean;
  value: number | null;
  formatValue?: (v: number) => string;
  className?: string;
}) {
  if (loading) {
    return <Skeleton className="h-12 w-20 rounded-md" />;
  }

  if (value === null) {
    return (
      <span
        className={cn(
          "text-5xl font-extrabold tracking-tight text-[#0A0A0A]",
          className,
        )}
      >
        —
      </span>
    );
  }

  return (
    <span
      className={cn(
        "text-5xl font-extrabold tracking-tight text-[#0A0A0A]",
        className,
      )}
    >
      {formatValue ? formatValue(value) : value}
    </span>
  );
}

function PerformanceMetricCard({
  loading,
  label,
  icon: Icon,
  iconClassName,
  children,
}: {
  loading: boolean;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-xl border-[#c7c6cb] bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#2055FD] hover:shadow-md">
      <CardContent className="p-0">
        <div className="mb-2 flex items-start justify-between">
          <span className="text-sm text-[#6B6B6B]">{label}</span>
          {loading ? (
            <Skeleton className="size-5 rounded" />
          ) : (
            <Icon className={cn("size-5", iconClassName)} />
          )}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function ResumeVaultCard({
  resume,
  index,
  loading,
}: {
  resume: RecentResume;
  index: number;
  loading: boolean;
}) {
  const badge = getResumeBadge(index, resume.atsScore);

  if (loading) {
    return (
      <Card className="rounded-xl border-[#c7c6cb] bg-white p-4 shadow-sm">
        <CardContent className="space-y-4 p-0">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Link href={`/app/editor?id=${resume.id}`}>
      <Card
        className={cn(
          "group relative cursor-pointer overflow-hidden rounded-xl border-[#c7c6cb] bg-white p-4 shadow-sm transition-all hover:border-[#2055FD] hover:shadow-md",
          badge.variant === "master" && "overflow-hidden",
        )}
      >
        {badge.variant === "master" ? (
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-[#2055FD] to-[#dde1ff]" />
        ) : null}
        <CardContent className="flex flex-col gap-4 p-0">
          <div className="flex items-start justify-between">
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-lg",
                badge.variant === "master"
                  ? "bg-[#f5f3f3] text-[#2055FD]"
                  : "bg-[#f5f3f3] text-[#6B6B6B]",
              )}
            >
              <FileText className="size-5" />
            </div>
            <span
              className={cn(
                "rounded border px-2 py-1 font-mono text-[11px] font-medium",
                badge.variant === "master" &&
                  "border-[#dde1ff] bg-[#2055FD]/10 text-[#2055FD]",
                badge.variant === "tailored" &&
                  "border-[#c7c6cb] bg-[#efeded] text-[#46464b]",
                badge.variant === "draft" &&
                  "border-[#c7c6cb] bg-[#efeded] text-[#46464b]",
              )}
            >
              {badge.label}
            </span>
          </div>
          <div>
            <h4 className="text-lg leading-snug font-semibold text-[#0A0A0A] group-hover:text-[#2055FD]">
              {resume.name}
            </h4>
            <p className="mt-1 text-sm text-[#6B6B6B] capitalize">
              {resume.template} · Updated{" "}
              {formatDistanceToNow(resume.modified, { addSuffix: true })}
            </p>
            {typeof resume.atsScore === "number" ? (
              <p className="mt-1 font-mono text-xs text-[#0EB87A]">
                ATS {resume.atsScore}%
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function PipelineRow({
  label,
  count,
  loading,
  dotClassName,
  badgeClassName,
}: {
  label: string;
  count: number;
  loading: boolean;
  dotClassName: string;
  badgeClassName: string;
}) {
  return (
    <div className="-mx-2 flex cursor-pointer items-center justify-between rounded-lg p-2 transition-colors hover:bg-[#f5f3f3]">
      <div className="flex items-center gap-3">
        <div className={cn("size-2 rounded-full", dotClassName)} />
        <span className="font-medium text-[#1b1c1c]">{label}</span>
      </div>
      {loading ? (
        <Skeleton className="h-6 w-8 rounded" />
      ) : (
        <span
          className={cn(
            "rounded px-2 py-0.5 font-mono text-xs font-medium",
            badgeClassName,
          )}
        >
          {count.toString().padStart(2, "0")}
        </span>
      )}
    </div>
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
    pipelineApplied: 0,
    pipelineInterviewing: 0,
    pipelineOffers: 0,
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
          pipelineApplied: 0,
          pipelineInterviewing: 0,
          pipelineOffers: 0,
        });
        setRecentResumes([]);
        return;
      }

      const [resumesResult, applicationsResult] = await Promise.all([
        supabase
          .from("resumes")
          .select("id, name, template, ats_score, updated_at, slug")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false }),
        supabase
          .from("job_applications")
          .select("status")
          .eq("user_id", user.id),
      ]);

      const resumeRows = (resumesResult.data ?? []) as Pick<
        Resume,
        "id" | "name" | "template" | "ats_score" | "updated_at" | "slug"
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
      const pipelineApplied = applicationRows.filter((row) =>
        ["applied", "screening"].includes(row.status),
      ).length;
      const pipelineInterviewing = applicationRows.filter(
        (row) => row.status === "interview",
      ).length;
      const pipelineOffers = applicationRows.filter(
        (row) => row.status === "offer",
      ).length;

      setMetrics({
        resumesCreated: visibleResumes.length,
        jobsApplied,
        avgAtsScore,
        interviewsScheduled,
        pipelineApplied,
        pipelineInterviewing,
        pipelineOffers,
      });

      setRecentResumes(
        visibleResumes.slice(0, 3).map((row) => ({
          id: row.id,
          name: row.name,
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
        pipelineApplied: 0,
        pipelineInterviewing: 0,
        pipelineOffers: 0,
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

  const profileGrade = getProfileStrengthGrade(
    metrics.avgAtsScore,
    metrics.resumesCreated,
  );

  const activityItems = useMemo<ActivityItem[]>(() => {
    return recentResumes.map((resume, index) => ({
      id: resume.id,
      title:
        index === 0
          ? `Updated ${resume.name}`
          : `Edited ${resume.name}`,
      timestamp: resume.modified,
      accent: index === 0 ? "azure" : "muted",
    }));
  }, [recentResumes]);

  const editorHref =
    recentResumes.length > 0
      ? `/app/editor?id=${recentResumes[0].id}`
      : "/app/editor";

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col gap-8 overflow-y-auto bg-[#f5f3f3] p-4 pb-24 md:p-10">
        <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-[13px] font-medium tracking-[0.05em] text-[#2055FD] uppercase">
              {getGreeting()}
            </p>
            <h2 className="mt-1 text-[28px] font-bold leading-9 tracking-tight text-[#0A0A0A] md:text-[32px] md:leading-10">
              Executive Overview
            </h2>
            <p className="mt-1 text-base text-[#6B6B6B]">
              Here is the current standing of your professional assets.
            </p>
            <p className="mt-1 text-sm text-[#82838b]">{today}</p>
          </div>
          <Button
            variant="outline"
            asChild
            className="rounded-lg border-[#c7c6cb] bg-white text-[15px] font-semibold text-[#2055FD] shadow-sm hover:border-[#2055FD] hover:bg-white"
          >
            <Link href={editorHref}>
              <Download className="size-[18px]" />
              Download Master PDF
            </Link>
          </Button>
        </header>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="flex flex-col gap-8 xl:col-span-8">
            <section>
              <SectionLabel>Performance Metrics</SectionLabel>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <PerformanceMetricCard
                  loading={metricsLoading}
                  label="Avg. ATS Score"
                  icon={BadgeCheck}
                  iconClassName="text-[#0EB87A]"
                >
                  <div className="flex items-baseline gap-1">
                    <MetricValue
                      loading={metricsLoading}
                      value={metrics.avgAtsScore}
                    />
                    {!metricsLoading && metrics.avgAtsScore !== null ? (
                      <span className="text-lg font-semibold text-[#0EB87A]">
                        %
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#efeded]">
                    {metricsLoading ? (
                      <Skeleton className="h-full w-full" />
                    ) : (
                      <div
                        className="h-full rounded-full bg-[#0EB87A] transition-all duration-500"
                        style={{
                          width: `${metrics.avgAtsScore ?? 0}%`,
                        }}
                      />
                    )}
                  </div>
                </PerformanceMetricCard>

                <PerformanceMetricCard
                  loading={metricsLoading}
                  label="Profile Strength"
                  icon={TrendingUp}
                  iconClassName="text-[#2055FD]"
                >
                  {metricsLoading ? (
                    <Skeleton className="h-12 w-16" />
                  ) : (
                    <span className="text-5xl font-extrabold tracking-tight text-[#0A0A0A]">
                      {profileGrade}
                    </span>
                  )}
                  <p className="mt-2 flex items-center gap-1 text-sm text-[#6B6B6B]">
                    <ArrowUp className="size-4 text-[#2055FD]" />
                    {metrics.resumesCreated} resume
                    {metrics.resumesCreated === 1 ? "" : "s"} in vault
                  </p>
                </PerformanceMetricCard>

                <PerformanceMetricCard
                  loading={metricsLoading}
                  label="Interview Invites"
                  icon={Mail}
                  iconClassName="text-[#6B6B6B]"
                >
                  <MetricValue
                    loading={metricsLoading}
                    value={metrics.interviewsScheduled}
                  />
                  <p className="mt-2 text-sm text-[#6B6B6B]">
                    {metrics.jobsApplied} active application
                    {metrics.jobsApplied === 1 ? "" : "s"}
                  </p>
                </PerformanceMetricCard>
              </div>
            </section>

            <section>
              <div className="mb-2 flex items-end justify-between">
                <SectionLabel>Resume Vault</SectionLabel>
                <Link
                  href="/app/editor"
                  className="text-[15px] font-semibold text-[#2055FD] hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {resumesLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <ResumeVaultCard
                      key={i}
                      resume={{
                        id: String(i),
                        name: "",
                        template: "",
                        modified: new Date(),
                        atsScore: null,
                      }}
                      index={i}
                      loading
                    />
                  ))
                ) : recentResumes.length === 0 ? (
                  <Card className="col-span-full rounded-xl border-[#c7c6cb] bg-white p-8 shadow-sm">
                    <CardContent className="flex flex-col items-center gap-4 p-0 text-center">
                      <div className="flex size-12 items-center justify-center rounded-lg bg-[#f5f3f3] text-[#2055FD]">
                        <FileText className="size-6" />
                      </div>
                      <p className="text-sm text-[#6B6B6B]">
                        No resumes yet. Build your master LaTeX base to get
                        started.
                      </p>
                      <Button
                        type="button"
                        className="rounded-lg bg-[#0A0A0A] text-white hover:bg-[#191b22]"
                        onClick={() => router.push("/app/generate")}
                      >
                        Build New Resume
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  recentResumes.map((resume, index) => (
                    <ResumeVaultCard
                      key={resume.id}
                      resume={resume}
                      index={index}
                      loading={false}
                    />
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="flex flex-col gap-8 xl:col-span-4">
            <section>
              <SectionLabel icon={Lightbulb}>AI Insights</SectionLabel>
              <Card className="relative overflow-hidden rounded-xl border-0 bg-[#191b22] text-white shadow-md">
                <div className="pointer-events-none absolute -top-10 -right-10 size-32 rounded-full bg-[#2055FD]/30 blur-2xl" />
                <CardContent className="relative z-10 space-y-4 p-6">
                  <div className="border-b border-white/20 pb-4">
                    <h4 className="mb-1 text-lg font-semibold">
                      Optimize for your next role
                    </h4>
                    <p className="text-sm text-[#c5c6ce]">
                      Tailor your master resume against a target job description
                      to lift ATS keyword alignment.
                    </p>
                    <Button
                      variant="link"
                      asChild
                      className="mt-3 h-auto p-0 text-[13px] font-semibold text-[#b8c4ff] hover:text-white"
                    >
                      <Link href="/app/tailor" className="gap-1">
                        Run Auto-Tailor
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                  </div>
                  <div>
                    <h4 className="mb-1 text-lg font-semibold">
                      Interview readiness
                    </h4>
                    <p className="text-sm text-[#c5c6ce]">
                      {metrics.interviewsScheduled > 0
                        ? `You have ${metrics.interviewsScheduled} interview${metrics.interviewsScheduled === 1 ? "" : "s"} in your pipeline. Review STAR coaching modules.`
                        : "Practice with AI interviewers trained on your resume and target roles."}
                    </p>
                    <Button
                      variant="link"
                      asChild
                      className="mt-3 h-auto p-0 text-[13px] font-semibold text-[#b8c4ff] hover:text-white"
                    >
                      <Link href="/app/interview" className="gap-1">
                        Start Prep
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section>
              <div className="mb-2 flex items-end justify-between">
                <SectionLabel>Active Pipeline</SectionLabel>
                <Link
                  href="/app/tracker"
                  className="text-[15px] font-semibold text-[#2055FD] hover:underline"
                >
                  Tracker
                </Link>
              </div>
              <Card className="rounded-xl border-[#c7c6cb] bg-white p-4 shadow-sm">
                <CardContent className="flex flex-col gap-1 p-0">
                  <PipelineRow
                    label="Applied"
                    count={metrics.pipelineApplied}
                    loading={metricsLoading}
                    dotClassName="bg-[#6B6B6B]"
                    badgeClassName="bg-[#efeded] text-[#46464b]"
                  />
                  <PipelineRow
                    label="Interviewing"
                    count={metrics.pipelineInterviewing}
                    loading={metricsLoading}
                    dotClassName="bg-[#2055FD]"
                    badgeClassName="border border-[#dde1ff] bg-[#2055FD]/10 text-[#2055FD]"
                  />
                  <PipelineRow
                    label="Offers"
                    count={metrics.pipelineOffers}
                    loading={metricsLoading}
                    dotClassName="bg-[#0EB87A] shadow-[0_0_8px_rgba(14,184,122,0.4)]"
                    badgeClassName="border border-[#0EB87A]/30 bg-[#0EB87A]/10 text-[#009763]"
                  />
                </CardContent>
              </Card>
            </section>

            <section>
              <SectionLabel>Recent Activity</SectionLabel>
              <Card className="rounded-xl border-[#c7c6cb] bg-white p-4 shadow-sm">
                <CardContent className="p-0">
                  {resumesLoading ? (
                    <div className="space-y-4 py-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                  ) : activityItems.length === 0 ? (
                    <p className="py-4 text-center text-sm text-[#6B6B6B]">
                      Activity will appear as you edit resumes and track
                      applications.
                    </p>
                  ) : (
                    <div className="relative ml-3 flex flex-col gap-6 border-l border-[#c7c6cb] py-2 pl-6">
                      {activityItems.map((item) => (
                        <div key={item.id} className="relative">
                          <div
                            className={cn(
                              "absolute top-1 -left-[31px] size-4 rounded-full border-2 bg-white",
                              item.accent === "azure"
                                ? "border-[#2055FD]"
                                : "border-[#c7c6cb]",
                            )}
                          />
                          <p className="text-sm font-medium text-[#1b1c1c]">
                            {item.title}
                          </p>
                          <p className="mt-0.5 text-[13px] text-[#6B6B6B]">
                            {format(item.timestamp, "MMM d, yyyy · h:mm a")}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>

      <Button
        type="button"
        onClick={() => router.push("/app/generate")}
        className={cn(
          "group fixed bottom-6 right-6 z-50 h-14 gap-0 overflow-hidden rounded-full",
          "bg-gradient-to-r from-[#2055FD] via-[#2558ff] to-[#003fd8]",
          "px-4 text-white shadow-lg shadow-[#2055FD]/40",
          "animate-pulse hover:animate-none hover:from-[#003fd8] hover:via-[#2055FD] hover:to-[#2558ff]",
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
