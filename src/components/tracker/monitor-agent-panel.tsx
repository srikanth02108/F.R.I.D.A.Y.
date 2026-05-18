"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bot,
  Loader2,
  Pause,
  Play,
  Radar,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  workspaceAzureButtonClass,
  workspaceCardClass,
  workspaceInputClass,
  workspaceLabelClass,
  workspaceOutlineButtonClass,
} from "@/components/workspace/workspace-styles";
import type { MonitorAgentMatch } from "@/types/tracker-monitor";
import { cn } from "@/lib/utils";

const SCAN_INTERVAL_MS = 12_000;

type ResumeOption = {
  id: string;
  name: string;
};

type MonitorAgentPanelProps = {
  resumes: ResumeOption[];
  onMatchFound: (match: MonitorAgentMatch) => void;
};

export function MonitorAgentPanel({
  resumes,
  onMatchFound,
}: MonitorAgentPanelProps) {
  const [companiesInput, setCompaniesInput] = useState("Google, Stripe");
  const [titlesInput, setTitlesInput] = useState(
    "Software Engineer, Backend Engineer",
  );
  const [sourceResumeId, setSourceResumeId] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [tick, setTick] = useState(0);
  const [lastStatus, setLastStatus] = useState(
    "Agent idle — configure targets and start monitoring.",
  );

  const tickRef = useRef(0);
  const isScanningRef = useRef(false);

  useEffect(() => {
    if (resumes.length > 0 && !sourceResumeId) {
      setSourceResumeId(resumes[0].id);
    }
  }, [resumes, sourceResumeId]);

  const runScan = useCallback(async () => {
    if (isScanningRef.current) return;

    const companies = companiesInput
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    const jobTitles = titlesInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (companies.length === 0 || jobTitles.length === 0) {
      toast.error("Enter at least one company and job title");
      return;
    }

    isScanningRef.current = true;
    setIsScanning(true);
    const nextTick = tickRef.current + 1;
    tickRef.current = nextTick;
    setTick(nextTick);

    try {
      const response = await fetch("/api/tracker/monitor-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companies,
          jobTitles,
          sourceResumeId: sourceResumeId || null,
          tick: nextTick,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { match?: MonitorAgentMatch | null; message?: string; error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Monitor agent scan failed");
      }

      setLastStatus(payload?.message ?? "Scan complete.");

      if (payload?.match) {
        onMatchFound(payload.match);
        toast.success(
          `New match: ${payload.match.role} at ${payload.match.company}`,
        );
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Monitor agent scan failed";
      toast.error(message);
      setLastStatus(message);
    } finally {
      isScanningRef.current = false;
      setIsScanning(false);
    }
  }, [companiesInput, titlesInput, sourceResumeId, onMatchFound]);

  useEffect(() => {
    if (!isActive) return;

    void runScan();

    const interval = window.setInterval(() => {
      void runScan();
    }, SCAN_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [isActive, runScan]);

  return (
    <Card
      className={cn(
        workspaceCardClass,
        "border-[#2055FD]/20 bg-gradient-to-br from-[#2055FD]/5 via-white to-[#f5f3f3]",
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Radar className="size-5 text-[#2055FD]" />
              F.R.I.D.A.Y. Automated Career Portal Web Scraper Agent
            </CardTitle>
            <CardDescription>
              Simulates continuous crawling of target company career boards.
              On match: JD parsing, background tailoring, and a new Saved card.
            </CardDescription>
          </div>
          <Badge
            className={cn(
              "shrink-0 border",
              isActive
                ? "border-[#0EB87A]/30 bg-[#0EB87A]/10 text-[#005233]"
                : "border-[#c7c6cb] bg-white text-[#6B6B6B]",
            )}
          >
            {isActive ? "Monitoring live" : "Agent paused"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="monitor-companies" className={workspaceLabelClass}>
              Target companies
            </Label>
            <Input
              id="monitor-companies"
              placeholder="Google, Stripe, Meta"
              value={companiesInput}
              onChange={(e) => setCompaniesInput(e.target.value)}
              disabled={isActive}
              className={workspaceInputClass}
            />
            <p className="text-xs text-[#6B6B6B]">Comma-separated company names</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monitor-titles" className={workspaceLabelClass}>
              Job title keywords
            </Label>
            <Input
              id="monitor-titles"
              placeholder="Software Engineer, Backend Engineer"
              value={titlesInput}
              onChange={(e) => setTitlesInput(e.target.value)}
              disabled={isActive}
              className={workspaceInputClass}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monitor-resume" className={workspaceLabelClass}>
              Base resume for auto-tailoring
            </Label>
            <Select
              value={sourceResumeId}
              onValueChange={setSourceResumeId}
              disabled={isActive || resumes.length === 0}
            >
              <SelectTrigger id="monitor-resume" className="w-full">
                <SelectValue placeholder="Select resume" />
              </SelectTrigger>
              <SelectContent>
                {resumes.map((resume) => (
                  <SelectItem key={resume.id} value={resume.id}>
                    {resume.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-xl border border-[#e9e8e7] bg-white/80 p-4">
          <div className="space-y-2 text-sm text-[#46464b]">
            <p className="flex items-center gap-2 font-medium text-[#0A0A0A]">
              <Bot className="size-4 text-[#2055FD]" />
              Agent pipeline
            </p>
            <ol className="list-decimal space-y-1 pl-5 text-xs leading-relaxed">
              <li>Crawl simulated career portals every 12s</li>
              <li>Parse JD requirements via Llama 3.3 70B</li>
              <li>Generate tailored LaTeX in the background</li>
              <li>Insert a Saved Kanban card with metadata</li>
            </ol>
            <p className="rounded-lg bg-[#f5f3f3] px-3 py-2 font-mono text-[11px] text-[#6B6B6B]">
              {lastStatus}
            </p>
            <p className="text-xs text-[#6B6B6B]">Scan cycles: {tick}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              className={cn(workspaceAzureButtonClass, "gap-2")}
              onClick={() => setIsActive((prev) => !prev)}
              disabled={isScanning && !isActive}
            >
              {isActive ? (
                <>
                  <Pause className="size-4" />
                  Pause agent
                </>
              ) : (
                <>
                  <Play className="size-4" />
                  Start monitoring
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className={workspaceOutlineButtonClass}
              onClick={() => void runScan()}
              disabled={isScanning}
            >
              {isScanning ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              Run scan now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
