"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  Key,
  LayoutTemplate,
  Loader2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";

import { FridayVerifiedBadge } from "@/components/ats-score/friday-verified-badge";
import { ScoreRing } from "@/components/ats-score/score-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  workspaceAzureButtonClass,
  workspaceCardClass,
  workspaceLabelClass,
  workspaceOutlineButtonClass,
  workspacePrimaryButtonClass,
} from "@/components/workspace/workspace-styles";
import { getOverallScoreMeta, getSeverityStyles, SEVERITY_ORDER } from "@/lib/ats-score-ui";
import type { AtsIssue, AtsScoreResult } from "@/types/ats-score";
import { cn } from "@/lib/utils";

type AtsScoreResultsProps = {
  result: AtsScoreResult;
  hasJobDescription: boolean;
  onRunAnother?: () => void;
};

function ScoreBar({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  if (value === null) return null;

  const barColor =
    value >= 85
      ? "bg-[#0EB87A]"
      : value >= 70
        ? "bg-[#2055FD]"
        : value >= 50
          ? "bg-amber-500"
          : "bg-red-500";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-medium text-[#46464b]">{label}</span>
        <span className="shrink-0 font-mono text-[13px] font-bold tabular-nums text-[#0A0A0A]">
          {value}/100
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#e9e8e7]">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function BreakdownMetricCard({
  title,
  subtitle,
  value,
  icon: Icon,
  description,
  variant = "default",
}: {
  title: string;
  subtitle: string;
  value: number | null;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  variant?: "default" | "success" | "warning" | "critical";
}) {
  if (value === null) return null;

  const valueColor =
    variant === "success"
      ? "text-[#0EB87A]"
      : variant === "critical"
        ? "text-red-600"
        : variant === "warning"
          ? "text-amber-700"
          : "text-[#0A0A0A]";

  const iconBg =
    variant === "success"
      ? "bg-[#0EB87A]/10 text-[#0EB87A]"
      : variant === "critical"
        ? "bg-red-50 text-red-600"
        : variant === "warning"
          ? "bg-amber-50 text-amber-700"
          : "bg-[#efeded] text-[#6B6B6B]";

  return (
    <article className={cn(workspaceCardClass, "flex h-full flex-col p-6")}>
      <header className="mb-4 flex items-start justify-between border-b border-[#e9e8e7]/80 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-lg",
              iconBg,
            )}
          >
            <Icon className="size-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold leading-tight text-[#0A0A0A]">
              {title}
            </h3>
            <span className={workspaceLabelClass}>{subtitle}</span>
          </div>
        </div>
        <div className="text-right">
          <span className={cn("text-2xl font-bold tabular-nums", valueColor)}>
            {value}%
          </span>
        </div>
      </header>
      <p className="text-sm text-[#6B6B6B]">{description}</p>
    </article>
  );
}

function IssueCard({ issue }: { issue: AtsIssue }) {
  const styles = getSeverityStyles(issue.severity);

  return (
    <div className="rounded-lg border border-[#c7c6cb] bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", styles.dot)} />
        <div className="min-w-0 flex-1 space-y-2">
          <Badge className={cn("border-0", styles.badge)}>{issue.section}</Badge>
          <p className="text-sm text-[#1b1c1c]">{issue.message}</p>
          <p className="text-sm italic text-[#6B6B6B]">{issue.suggestion}</p>
        </div>
      </div>
    </div>
  );
}

export function AtsScoreResults({
  result,
  hasJobDescription,
  onRunAnother,
}: AtsScoreResultsProps) {
  const [showAllIssues, setShowAllIssues] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const meta = getOverallScoreMeta(result.overall_score);

  const handleExportScorecard = async () => {
    setIsExportingPdf(true);

    try {
      const response = await fetch("/api/ats-score/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result, hasJobDescription }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? "PDF export failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "friday-ats-scorecard.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("ATS scorecard downloaded");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not export PDF";
      toast.error(message);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const sortedIssues = useMemo(
    () =>
      [...result.issues].sort(
        (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
      ),
    [result.issues],
  );

  const visibleIssues = showAllIssues
    ? sortedIssues
    : sortedIssues.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-3">
        {onRunAnother ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={workspaceOutlineButtonClass}
            onClick={onRunAnother}
          >
            Run Another Check
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          className={cn(workspaceAzureButtonClass, "gap-2")}
          onClick={() => void handleExportScorecard()}
          disabled={isExportingPdf}
        >
          {isExportingPdf ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          Export ATS Scorecard as PDF
        </Button>
      </div>

      <section
        className={cn(
          workspaceCardClass,
          "relative overflow-hidden border-[#c7c6cb] bg-gradient-to-br from-white via-[#fbf9f8] to-[#2055FD]/5 p-6 md:p-10",
          meta.borderClass,
        )}
      >
        <div className="pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-[#0EB87A]/5 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[auto_1fr] lg:items-center">
          <div className="relative flex justify-center lg:justify-start">
            <ScoreRing score={result.overall_score} />
            <div className="absolute -top-1 right-0 lg:-top-2 lg:right-2">
              <FridayVerifiedBadge />
            </div>
          </div>
          <div className="space-y-4 text-center lg:text-left">
            <p className={cn(workspaceLabelClass, "text-[#2055FD]")}>
              Corporate ATS Analytics Dashboard
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-[#0A0A0A] md:text-3xl">
              {meta.label} Match — {result.overall_score}/100
            </h2>
            <p className="text-base leading-relaxed text-[#46464b]">
              This analyzer applies standard deep-parsing token match matrices
              mapped through the{" "}
              <span className="font-semibold text-[#0A0A0A]">
                Llama 3.3 70B
              </span>{" "}
              engine to emulate modern corporate applicant tracking screeners.
              Scores reflect keyword alignment, structural compliance, and
              quantification density relative to your target role.
            </p>
            {result.overall_score >= 70 && (
              <span className="mx-auto inline-flex w-fit items-center gap-2 rounded-full border border-[#0EB87A]/20 bg-[#0EB87A]/10 px-3 py-1 font-mono text-[12px] font-bold tracking-wider text-[#005233] uppercase lg:mx-0">
                <CheckCircle2 className="size-4" />
                {result.overall_score >= 85
                  ? "Top tier match"
                  : "Strong alignment"}
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        {hasJobDescription && (
          <BreakdownMetricCard
            title="Keyword Match"
            subtitle="Semantic relevance"
            value={result.keyword_match_score}
            icon={Key}
            description="Core industry terminologies mapped against your target job description."
            variant={
              (result.keyword_match_score ?? 0) >= 85
                ? "success"
                : (result.keyword_match_score ?? 0) >= 70
                  ? "default"
                  : "warning"
            }
          />
        )}
        <BreakdownMetricCard
          title="Format & Structure"
          subtitle="Section hierarchy"
          value={result.format_score}
          icon={LayoutTemplate}
          description="LaTeX structure and section ordering for ATS linear parsing."
          variant={
            (result.format_score ?? 0) >= 85
              ? "success"
              : (result.format_score ?? 0) < 60
                ? "critical"
                : "warning"
          }
        />
        <BreakdownMetricCard
          title="Content Completeness"
          subtitle="Required sections"
          value={result.completeness_score}
          icon={CheckCircle2}
          description="Coverage of experience, education, skills, and contact vectors."
          variant={(result.completeness_score ?? 0) >= 80 ? "success" : "default"}
        />
        <BreakdownMetricCard
          title="Metric Quantification"
          subtitle="Impact density"
          value={result.quantification_score}
          icon={TrendingUp}
          description="Measurable outcomes and scale indicators in your bullet points."
          variant={
            (result.quantification_score ?? 0) >= 75 ? "success" : "warning"
          }
        />
      </div>

      <Card className={cn(workspaceCardClass, "border-0 shadow-none")}>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#0A0A0A]">
            Full Score Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {hasJobDescription && (
            <ScoreBar
              label="Keyword Match Score"
              value={result.keyword_match_score}
            />
          )}
          <ScoreBar label="Format & Structure Compliance" value={result.format_score} />
          <ScoreBar label="Content Completeness" value={result.completeness_score} />
          <ScoreBar
            label="Metric Quantification Density"
            value={result.quantification_score}
          />
          <ScoreBar
            label="Readability & Parsing Index"
            value={result.readability_score}
          />
        </CardContent>
      </Card>

      <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 p-5">
        <h3 className="font-semibold text-amber-950">
          Fix These 3 Things to Add ~15 Points
        </h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-amber-950">
          {result.top_fixes.map((fix, index) => (
            <li key={`${index}-${fix.slice(0, 24)}`}>{fix}</li>
          ))}
        </ol>
      </div>

      {(result.missing_keywords.length > 0 || result.found_keywords.length > 0) &&
        hasJobDescription && (
          <Card className={cn(workspaceCardClass, "border-0 shadow-none")}>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-[#0A0A0A]">
                Keyword Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.found_keywords.length > 0 && (
                <div>
                  <p className={cn(workspaceLabelClass, "mb-2")}>Found keywords</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.found_keywords.map((keyword) => (
                      <Badge
                        key={keyword}
                        className="border border-[#0EB87A]/20 bg-[#0EB87A]/10 text-[#005233]"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {result.missing_keywords.length > 0 && (
                <div>
                  <p className={cn(workspaceLabelClass, "mb-2")}>Missing keywords</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missing_keywords.map((keyword) => (
                      <Badge
                        key={keyword}
                        variant="outline"
                        className="border-red-200 bg-red-50 text-red-700"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

      <div className="grid grid-cols-12 gap-4 lg:gap-6">
        <div className="col-span-12 space-y-4 lg:col-span-7">
          <h3 className="text-base font-semibold text-[#0A0A0A]">Issues Found</h3>
          {sortedIssues.length === 0 ? (
            <Card className={cn(workspaceCardClass, "border-0 shadow-none")}>
              <CardContent className="py-6 text-sm text-[#6B6B6B]">
                No major issues detected. Great work!
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-3">
                {visibleIssues.map((issue, index) => (
                  <IssueCard key={`${issue.section}-${index}`} issue={issue} />
                ))}
              </div>
              {sortedIssues.length > 3 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllIssues((prev) => !prev)}
                  className="w-full border-[#c7c6cb]"
                >
                  {showAllIssues ? (
                    <>
                      <ChevronUp className="size-4" />
                      Show Fewer Issues
                    </>
                  ) : (
                    <>
                      <ChevronDown className="size-4" />
                      Show All Issues ({sortedIssues.length})
                    </>
                  )}
                </Button>
              )}
            </>
          )}
        </div>

        <div className="col-span-12 lg:col-span-5">
          <h3 className="mb-4 text-base font-semibold text-[#0A0A0A]">Strengths</h3>
          <Card className="h-full border-[#0EB87A]/30 bg-gradient-to-br from-[#0EB87A]/5 to-white">
            <CardContent className="space-y-3 p-5">
              {result.strengths.length === 0 ? (
                <p className="text-sm text-[#6B6B6B]">
                  No strengths highlighted yet. Tailor your resume to improve
                  alignment.
                </p>
              ) : (
                result.strengths.map((strength) => (
                  <div key={strength} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#0EB87A]" />
                    <p className="text-sm text-[#46464b]">{strength}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-[#2055FD]/20 bg-gradient-to-r from-[#2055FD]/5 to-white">
        <CardContent className="flex flex-col items-center justify-between gap-4 py-8 text-center sm:flex-row sm:text-left">
          <div>
            <p className="font-semibold text-[#0A0A0A]">
              Want us to optimize these sections automatically?
            </p>
            <p className="mt-1 text-sm text-[#6B6B6B]">
              Tailor your resume to this job with Groq AI in one click.
            </p>
          </div>
          <Button asChild className={cn(workspacePrimaryButtonClass, "shrink-0 gap-2")}>
            <Link href="/app/tailor">
              <Sparkles className="size-4 text-[#2055FD]" />
              Tailor Your Resume with AI
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
