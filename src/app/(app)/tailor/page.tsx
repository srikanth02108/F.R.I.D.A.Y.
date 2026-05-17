"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  ClipboardCopy,
  Download,
  FileText,
  Loader2,
  Save,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";

import { LatexDiffView } from "@/components/tailor/latex-diff-view";
import { SkillsGapDashboard } from "@/components/tailor/skills-gap-dashboard";
import { SkillsGapSkeleton } from "@/components/tailor/skills-gap-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  compileLatexToPdfBlob,
  downloadPdfBlob,
  sanitizeResumeFilename,
} from "@/lib/compile-latex";
import { resumeContentToPlainText } from "@/lib/interview-utils";
import { createEmptyResumeContent } from "@/lib/resume-content";
import { sanitizeGeneratedLatex } from "@/lib/sanitize-latex";
import { createClient } from "@/lib/supabase/client";
import { streamSsePost } from "@/lib/stream-sse";
import type { AtsScoreResult } from "@/types/ats-score";
import type { SkillsGapResult } from "@/types/skills-gap";
import type { Resume, UserProfile } from "@/types/database";
import {
  WorkspacePageHeader,
  workspaceAzureButtonClass,
  workspaceCardClass,
  tailorResumePanelClass,
  workspaceInputClass,
  workspaceLabelClass,
  workspaceOutlineButtonClass,
  workspacePageClass,
  workspacePrimaryButtonClass,
  workspaceScrollClass,
} from "@/components/workspace/workspace-styles";
import { cn } from "@/lib/utils";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-48 items-center justify-center bg-[#1e1e1e] text-sm text-slate-400">
      Loading…
    </div>
  ),
});

type SavedResumeOption = {
  id: string;
  title: string;
  template: string;
  latex: string;
};

type JobLevel = "Junior" | "Mid" | "Senior";

type JdAnalysis = {
  keySkills: string[];
  requiredExperience: string;
  jobLevel: JobLevel;
};

const TAILORED_RESUME_TITLE = "Tailored Resume";

const COVER_LETTER_TONES = ["Professional", "Enthusiastic", "Casual"] as const;

function jobLevelBadgeClass(level: JobLevel) {
  switch (level) {
    case "Junior":
      return "bg-[#2055FD]/10 text-[#2055FD] border-[#2055FD]/20";
    case "Senior":
      return "bg-amber-50 text-amber-800 border-amber-200";
    default:
      return "bg-[#efeded] text-[#46464b] border-[#c7c6cb]";
  }
}

export default function Page() {
  const router = useRouter();

  const [jobDescription, setJobDescription] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [currentResumeLatex, setCurrentResumeLatex] = useState("");
  const [tailoredResumeLatex, setTailoredResumeLatex] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diffModeActive, setDiffModeActive] = useState(false);
  const [atsBeforeScore, setAtsBeforeScore] = useState<number | null>(null);
  const [atsAfterScore, setAtsAfterScore] = useState<number | null>(null);

  const [savedResumes, setSavedResumes] = useState<SavedResumeOption[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [usePasteMode, setUsePasteMode] = useState(false);
  const [jdAnalysis, setJdAnalysis] = useState<JdAnalysis | null>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpeningEditor, setIsOpeningEditor] = useState(false);

  const [isCoverLetterModalOpen, setIsCoverLetterModalOpen] = useState(false);
  const [selectedTone, setSelectedTone] = useState("Professional");
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState("");
  const [isLetterStreaming, setIsLetterStreaming] = useState(false);

  const [skillsGapData, setSkillsGapData] = useState<SkillsGapResult | null>(
    null,
  );
  const [isSkillsGapLoading, setIsSkillsGapLoading] = useState(false);

  const selectedResume = savedResumes.find((r) => r.id === selectedResumeId);
  const isComplete = tailoredResumeLatex.length > 0 && !isProcessing;
  const scoresVerified =
    atsBeforeScore !== null && atsAfterScore !== null;
  const coverLetterReady = isComplete && scoresVerified;
  const hasCoverLetterText = generatedCoverLetter.trim().length > 0;
  const showSkillsGapSection =
    isComplete && (isSkillsGapLoading || skillsGapData !== null);
  const showJdInsights = Boolean(jdAnalysis);
  const isBusy =
    isProcessing ||
    isAnalyzing ||
    isExporting ||
    isSaving ||
    isOpeningEditor ||
    isLetterStreaming;

  const loadResumes = useCallback(async () => {
    setLoadingResumes(true);
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setLoadingResumes(false);
      return;
    }

    const { data, error } = await supabase
      .from("resumes")
      .select("id, title, template, content")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    setLoadingResumes(false);

    if (error) {
      toast.error(`Could not load resumes: ${error.message}`);
      return;
    }

    const options = (data ?? []).map((row) => {
      const resume = row as Pick<Resume, "id" | "title" | "template" | "content">;
      return {
        id: resume.id,
        title: resume.title,
        template: resume.template,
        latex: resume.content?.latexSource ?? "",
      };
    });

    setSavedResumes(options);

    if (options.length > 0) {
      setSelectedResumeId((current) => {
        const match = options.find((o) => o.id === current);
        if (match) return current;
        setCurrentResumeLatex(options[0].latex);
        return options[0].id;
      });
    }
  }, []);

  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  useEffect(() => {
    if (usePasteMode || !selectedResumeId) return;
    const resume = savedResumes.find((r) => r.id === selectedResumeId);
    if (resume) {
      setCurrentResumeLatex(resume.latex);
    }
  }, [selectedResumeId, savedResumes, usePasteMode]);

  const fetchUserProfile = async (): Promise<Record<string, unknown>> => {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("You must be signed in");
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !data) {
      return { id: user.id, email: user.email ?? "" };
    }

    return data as UserProfile;
  };

  const fetchJdAnalysis = async (showToast = true) => {
    const response = await fetch("/api/analyze-jd", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobDescription: jobDescription.trim() }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new Error(payload?.error ?? "Failed to analyze job description");
    }

    const result = (await response.json()) as JdAnalysis;
    setJdAnalysis(result);
    if (showToast) {
      toast.success("Job description analyzed");
    }
  };

  const runJdAnalysis = async () => {
    if (!jobDescription.trim()) {
      toast.error("Paste a job description first");
      return;
    }

    setIsAnalyzing(true);

    try {
      await fetchJdAnalysis(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Analysis failed";
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const scoreResume = async (resumeText: string): Promise<AtsScoreResult> => {
    const response = await fetch("/api/ats-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resumeText,
        jobDescription: jobDescription.trim() || undefined,
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | AtsScoreResult
      | { error?: string; details?: string }
      | null;

    if (!response.ok) {
      throw new Error(
        payload && "error" in payload
          ? `${payload.error}${payload.details ? `: ${payload.details}` : ""}`
          : "Failed to calculate ATS score",
      );
    }

    if (!payload || !("overall_score" in payload)) {
      throw new Error("Invalid ATS score response");
    }

    return payload;
  };

  const fetchAtsScores = async (before: string, after: string) => {
    const [beforeResult, afterResult] = await Promise.all([
      scoreResume(before),
      scoreResume(after),
    ]);

    setAtsBeforeScore(beforeResult.overall_score);
    setAtsAfterScore(afterResult.overall_score);
  };

  const fetchSkillsGap = async (resumeText: string) => {
    setIsSkillsGapLoading(true);
    setSkillsGapData(null);

    try {
      const response = await fetch("/api/skills-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription: jobDescription.trim(),
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | SkillsGapResult
        | { error?: string; details?: string }
        | null;

      if (!response.ok) {
        const message =
          payload && "error" in payload
            ? `${payload.error}${payload.details ? `: ${payload.details}` : ""}`
            : "Skills gap analysis failed";
        throw new Error(message);
      }

      if (!payload || !("match_percentage" in payload)) {
        throw new Error("Invalid skills gap response from server");
      }

      setSkillsGapData(payload);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Skills gap analysis could not be completed";
      toast.error(message);
      setSkillsGapData(null);
    } finally {
      setIsSkillsGapLoading(false);
    }
  };

  const handleTailor = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please paste a job description");
      return;
    }

    if (!currentResumeLatex.trim()) {
      toast.error("Select or paste your current resume LaTeX");
      return;
    }

    setIsProcessing(true);
    setTailoredResumeLatex("");
    setAtsBeforeScore(null);
    setAtsAfterScore(null);
    setSkillsGapData(null);
    const beforeLatex = sanitizeGeneratedLatex(currentResumeLatex);

    try {
      const userProfile = await fetchUserProfile();
      let accumulated = "";

      await streamSsePost(
        "/api/tailor-resume",
        {
          jobDescription: jobDescription.trim(),
          currentResume: beforeLatex,
          userProfile,
        },
        (chunk) => {
          accumulated += chunk;
          setTailoredResumeLatex(sanitizeGeneratedLatex(accumulated));
        },
      );

      const finalLatex = sanitizeGeneratedLatex(accumulated);

      if (!finalLatex.trim()) {
        throw new Error("Tailoring returned empty content. Please try again.");
      }

      setTailoredResumeLatex(finalLatex);

      if (!jdAnalysis) {
        try {
          await fetchJdAnalysis(false);
        } catch {
          // JD insights are optional after tailoring
        }
      }

      await fetchAtsScores(beforeLatex, finalLatex);
      await fetchSkillsGap(finalLatex);
      toast.success("Resume tailored for this job");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Tailoring failed";
      toast.error(message);
      setTailoredResumeLatex("");
      setSkillsGapData(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenInEditor = async () => {
    if (!tailoredResumeLatex.trim()) {
      toast.error("Tailor a resume first");
      return;
    }

    setIsOpeningEditor(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("You must be signed in");
      }

      const latex = sanitizeGeneratedLatex(tailoredResumeLatex);
      const template = selectedResume?.template ?? "classic";

      const { data, error } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          title: TAILORED_RESUME_TITLE,
          template,
          slug: null,
          content: createEmptyResumeContent(latex),
          ats_score: atsAfterScore,
          is_public: false,
        })
        .select("id")
        .single();

      if (error) throw new Error(error.message);
      if (!data) throw new Error("Failed to save resume");

      router.push(`/app/editor?id=${data.id}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not open editor";
      toast.error(message);
    } finally {
      setIsOpeningEditor(false);
    }
  };

  const handleSaveAsNewVersion = async () => {
    if (!tailoredResumeLatex.trim()) {
      toast.error("Tailor a resume first");
      return;
    }

    setIsSaving(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("You must be signed in");
      }

      const latex = sanitizeGeneratedLatex(tailoredResumeLatex);
      const template = selectedResume?.template ?? "classic";
      const title = selectedResume
        ? `${selectedResume.title} (Tailored)`
        : TAILORED_RESUME_TITLE;

      const { error } = await supabase.from("resumes").insert({
        user_id: user.id,
        title,
        template,
        slug: null,
        content: createEmptyResumeContent(latex),
        ats_score: atsAfterScore,
        is_public: false,
      });

      if (error) throw new Error(error.message);

      toast.success("Saved as new resume version");
      await loadResumes();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save resume";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const parseSseLine = (
    line: string,
    onText: (chunk: string) => void,
  ): void => {
    if (!line.startsWith("data: ")) return;

    const data = line.slice(6).trim();
    if (!data || data === "[DONE]") return;

    let parsed: { text?: string; error?: string };
    try {
      parsed = JSON.parse(data) as { text?: string; error?: string };
    } catch {
      return;
    }

    if (parsed.error) {
      throw new Error(parsed.error);
    }

    if (parsed.text) {
      onText(parsed.text);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!jobDescription.trim()) {
      toast.error("Paste a job description first");
      return;
    }

    if (!tailoredResumeLatex.trim()) {
      toast.error("Tailor a resume before generating a cover letter");
      return;
    }

    setIsLetterStreaming(true);
    setGeneratedCoverLetter("");

    try {
      const userProfile = await fetchUserProfile();
      const resumeText = resumeContentToPlainText(
        undefined,
        sanitizeGeneratedLatex(tailoredResumeLatex),
      );

      const response = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription: jobDescription.trim(),
          userProfile,
          tone: selectedTone,
        }),
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(
          errorPayload?.error ?? "Cover letter generation failed",
        );
      }

      if (!response.body) {
        throw new Error("No response stream received from the server");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          parseSseLine(line, (chunk) => {
            accumulated += chunk;
            setGeneratedCoverLetter(accumulated);
          });
        }
      }

      if (buffer.startsWith("data: ")) {
        parseSseLine(buffer, (chunk) => {
          accumulated += chunk;
          setGeneratedCoverLetter(accumulated);
        });
      }

      if (!accumulated.trim()) {
        throw new Error("Cover letter generation returned empty content");
      }

      toast.success("Cover letter ready");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Cover letter generation failed";
      toast.error(message);
      setGeneratedCoverLetter("");
    } finally {
      setIsLetterStreaming(false);
    }
  };

  const handleCopyCoverLetter = async () => {
    if (!generatedCoverLetter.trim()) return;

    try {
      await navigator.clipboard.writeText(generatedCoverLetter);
      toast.success("Cover letter copied");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  const openCoverLetterModal = () => {
    setGeneratedCoverLetter("");
    setSelectedTone("Professional");
    setIsCoverLetterModalOpen(true);
  };

  const handleExportPdf = async () => {
    if (!tailoredResumeLatex.trim()) {
      toast.error("Tailor a resume first");
      return;
    }

    setIsExporting(true);

    try {
      const blob = await compileLatexToPdfBlob(
        sanitizeGeneratedLatex(tailoredResumeLatex),
      );
      downloadPdfBlob(
        blob,
        sanitizeResumeFilename(
          selectedResume?.title ?? TAILORED_RESUME_TITLE,
        ),
      );
      toast.success("PDF downloaded");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "PDF export failed";
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={cn(workspacePageClass, "h-[calc(100vh-4rem)]")}>
      {/* Top bar */}
      <div className={cn(workspaceScrollClass, "pb-28")}>
        <WorkspacePageHeader
          badge="Job alignment"
          title="Tailor for Job"
          description="Paste the job description and AI will rewrite your resume to maximize ATS match."
        />
        <div className="grid grid-cols-12 gap-4">
          {/* Panel 1 — Job description */}
          <div className={cn(workspaceCardClass, "col-span-12 flex min-h-[420px] flex-col lg:col-span-4")}>
            <div className="border-b border-[#e9e8e7] px-4 py-3 md:px-6">
              <Label className="text-sm font-semibold text-[#0A0A0A]">Target Job Description</Label>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
              <Textarea
                rows={12}
                placeholder="Paste the full job posting here…"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={isBusy}
                className={cn(workspaceInputClass, "min-h-[200px] flex-1 resize-none")}
              />

              <Button
                variant="outline"
                size="sm"
                onClick={runJdAnalysis}
                disabled={isBusy || !jobDescription.trim()}
                className={cn(workspaceOutlineButtonClass, "w-fit")}
              >
                {isAnalyzing ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
                Analyze JD
              </Button>

              {showJdInsights && jdAnalysis && (
                <div className="space-y-4 rounded-lg border border-[#e9e8e7] bg-[#f5f3f3] p-4">
                  <div>
                    <p className={cn(workspaceLabelClass, "mb-2")}>
                      Key Skills Required
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {jdAnalysis.keySkills.map((skill) => (
                        <Badge
                          key={skill}
                          className="border border-[#2055FD]/20 bg-[#2055FD]/10 text-[#2055FD]"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className={cn(workspaceLabelClass, "mb-1")}>
                      Required Experience
                    </p>
                    <p className="text-sm text-[#46464b]">
                      {jdAnalysis.requiredExperience}
                    </p>
                  </div>
                  <div>
                    <p className={cn(workspaceLabelClass, "mb-2")}>
                      Job Level
                    </p>
                    <Badge
                      className={cn(
                        "border",
                        jobLevelBadgeClass(jdAnalysis.jobLevel),
                      )}
                    >
                      {jdAnalysis.jobLevel}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Panel 2 — Current resume */}
          <div className={cn(tailorResumePanelClass, "col-span-12 flex min-h-[420px] flex-col lg:col-span-3")}>
            <div className="border-b border-[#e9e8e7] px-4 py-3 dark:border-zinc-800">
              <Label className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Your Current Resume</Label>
              {selectedResume && !usePasteMode && (
                <p className="mt-0.5 truncate text-xs text-[#2055FD]">
                  {selectedResume.title}
                </p>
              )}
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="paste-mode" className="text-xs text-slate-600 dark:text-zinc-400">
                  Paste custom LaTeX
                </Label>
                <Switch
                  id="paste-mode"
                  checked={usePasteMode}
                  onCheckedChange={setUsePasteMode}
                  disabled={isBusy}
                />
              </div>

              {!usePasteMode ? (
                savedResumes.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No saved resumes. Enable paste mode or create one in the
                    editor.
                  </p>
                ) : (
                  <Select
                    value={selectedResumeId}
                    onValueChange={setSelectedResumeId}
                    disabled={isBusy || loadingResumes}
                  >
                    <SelectTrigger className="w-full bg-white dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50">
                      <SelectValue
                        placeholder={
                          loadingResumes ? "Loading…" : "Select a resume"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {savedResumes.map((resume) => (
                        <SelectItem key={resume.id} value={resume.id}>
                          {resume.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )
              ) : (
                <Textarea
                  rows={6}
                  placeholder="Paste your LaTeX resume here…"
                  value={currentResumeLatex}
                  onChange={(e) => setCurrentResumeLatex(e.target.value)}
                  disabled={isBusy}
                  className="font-mono text-xs"
                />
              )}

              <div className="min-h-[220px] flex-1 overflow-hidden rounded-lg border border-[#c7c6cb] bg-[#0A0A0A]">
                {!usePasteMode && (
                  <MonacoEditor
                    height="100%"
                    language="latex"
                    theme="vs-dark"
                    value={currentResumeLatex}
                    options={{
                      readOnly: true,
                      wordWrap: "on",
                      fontSize: 12,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                )}
                {usePasteMode && (
                  <MonacoEditor
                    height="100%"
                    language="latex"
                    theme="vs-dark"
                    value={currentResumeLatex}
                    onChange={(v) => setCurrentResumeLatex(v ?? "")}
                    options={{
                      readOnly: false,
                      wordWrap: "on",
                      fontSize: 12,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Panel 3 — Tailored result (after tailoring) */}
          <div className={cn(tailorResumePanelClass, "relative col-span-12 flex min-h-[420px] flex-col lg:col-span-5")}>
            {(isProcessing || isComplete) && (
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white/90 px-4 py-1.5 shadow-sm backdrop-blur-md dark:border-zinc-700 dark:bg-zinc-900/90">
                <span className="size-2 animate-pulse rounded-full bg-[#2055FD] dark:bg-violet-500" />
                <span className={cn(workspaceLabelClass, "text-zinc-900 dark:text-zinc-50")}>
                  {isProcessing ? "Live: Tailoring" : "Tailored"}
                </span>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e9e8e7] px-4 py-3 dark:border-zinc-800">
              <Label className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Tailored Resume</Label>
              {isComplete && (
                <Tabs
                  value={diffModeActive ? "diff" : "code"}
                  onValueChange={(v) => setDiffModeActive(v === "diff")}
                >
                  <TabsList className="h-8">
                    <TabsTrigger value="code" className="text-xs">
                      Code
                    </TabsTrigger>
                    <TabsTrigger value="diff" className="text-xs">
                      Before/After Diff
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
              {atsBeforeScore !== null && atsAfterScore !== null && isComplete && (
                <div className="rounded-lg border border-[#0EB87A]/30 bg-[#0EB87A]/10 px-4 py-3 text-center">
                  <p className="text-sm font-semibold text-[#005233]">
                    ATS Match Score
                  </p>
                  <p className="mt-1 flex items-center justify-center gap-2 text-lg font-bold text-[#0EB87A]">
                    Before: {atsBeforeScore}%
                    <ArrowRight className="size-4" />
                    After: {atsAfterScore}%
                  </p>
                </div>
              )}

              {!tailoredResumeLatex && !isProcessing ? (
                <Card className="flex flex-1 flex-col items-center justify-center border-dashed shadow-none">
                  <CardContent className="flex flex-col items-center py-12 text-center">
                    <Sparkles className="mb-3 size-10 text-slate-300" />
                    <p className="text-sm text-slate-500">
                      Your tailored resume will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : isProcessing ? (
                <div className="min-h-[280px] flex-1 rounded-lg border-2 border-[#2055FD]/50 bg-[#0A0A0A] p-4 animate-pulse">
                  <pre className="h-full overflow-auto font-mono text-xs leading-relaxed whitespace-pre-wrap text-[#f5f3f3]">
                    {tailoredResumeLatex || " "}
                  </pre>
                </div>
              ) : diffModeActive ? (
                <LatexDiffView
                  before={sanitizeGeneratedLatex(currentResumeLatex)}
                  after={tailoredResumeLatex}
                  className="min-h-[280px] flex-1"
                />
              ) : (
                <div className="min-h-[280px] flex-1 overflow-hidden rounded-lg border border-[#c7c6cb] bg-[#0A0A0A]">
                  <MonacoEditor
                    height="100%"
                    language="latex"
                    theme="vs-dark"
                    value={tailoredResumeLatex}
                    options={{
                      readOnly: true,
                      wordWrap: "on",
                      fontSize: 12,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>
              )}

              {isComplete && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Button
                    className={workspacePrimaryButtonClass}
                    size="sm"
                    onClick={handleOpenInEditor}
                    disabled={isBusy}
                  >
                    {isOpeningEditor ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <FileText className="size-3.5" />
                    )}
                    Open in Editor
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={workspaceOutlineButtonClass}
                    onClick={handleExportPdf}
                    disabled={isBusy}
                  >
                    {isExporting ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Download className="size-3.5" />
                    )}
                    Export PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={workspaceOutlineButtonClass}
                    onClick={handleSaveAsNewVersion}
                    disabled={isBusy}
                  >
                    {isSaving ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Save className="size-3.5" />
                    )}
                    Save as New Version
                  </Button>
                  </div>
                  {coverLetterReady && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={openCoverLetterModal}
                      disabled={isBusy}
                      className="w-full sm:w-auto"
                    >
                      Generate Cover Letter ✨
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {showSkillsGapSection && (
          <div className="mt-6 w-full">
            {isSkillsGapLoading ? (
              <SkillsGapSkeleton />
            ) : (
              skillsGapData && <SkillsGapDashboard data={skillsGapData} />
            )}
          </div>
        )}
      </div>

      <Dialog
        open={isCoverLetterModalOpen}
        onOpenChange={(open) => {
          if (!isLetterStreaming) {
            setIsCoverLetterModalOpen(open);
          }
        }}
      >
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI-Powered Cover Letter Generator</DialogTitle>
            <DialogDescription>
              Draft a persuasive, role-specific letter from your tailored resume,
              job description, and profile. Pick a tone, then generate.
            </DialogDescription>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto py-2">
            <div className="space-y-2">
              <Label htmlFor="cover-letter-tone">Tone</Label>
              <Select
                value={selectedTone}
                onValueChange={setSelectedTone}
                disabled={isLetterStreaming}
              >
                <SelectTrigger id="cover-letter-tone">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  {COVER_LETTER_TONES.map((tone) => (
                    <SelectItem key={tone} value={tone}>
                      {tone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="button"
              onClick={() => void handleGenerateCoverLetter()}
              disabled={isLetterStreaming}
              className={cn(workspaceAzureButtonClass, "w-full gap-2")}
            >
              {isLetterStreaming ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Generating letter…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Generate Letter
                </>
              )}
            </Button>

            <div className="min-h-0 flex-1 space-y-2">
              <Label htmlFor="cover-letter-output" className="sr-only">
                Cover letter output
              </Label>
              <Textarea
                id="cover-letter-output"
                rows={12}
                value={generatedCoverLetter}
                onChange={(e) => setGeneratedCoverLetter(e.target.value)}
                disabled={isLetterStreaming}
                placeholder="Your AI-generated cover letter will stream here. Click Generate Letter to begin."
                className={cn(
                  "min-h-[280px] flex-1 resize-y leading-relaxed",
                  !hasCoverLetterText &&
                    !isLetterStreaming &&
                    "text-muted-foreground placeholder:text-slate-400",
                )}
                readOnly={isLetterStreaming}
              />
            </div>
          </div>

          {hasCoverLetterText && !isLetterStreaming && (
            <DialogFooter className="gap-2 border-t border-[#e9e8e7] bg-[#f5f3f3]/80 pt-4 sm:justify-between">
              <Button
                variant="outline"
                onClick={() => setIsCoverLetterModalOpen(false)}
              >
                Close Window
              </Button>
              <Button
                variant="secondary"
                onClick={() => void handleCopyCoverLetter()}
                className="gap-2"
              >
                <ClipboardCopy className="size-4" />
                Copy to Clipboard
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <div className="fixed right-0 bottom-0 left-0 z-40 border-t border-[#c7c6cb] bg-white/90 px-4 py-4 backdrop-blur-md md:left-60">
        <Button
          type="button"
          size="lg"
          disabled={isBusy}
          onClick={handleTailor}
          className={cn(workspacePrimaryButtonClass, "w-full gap-2 py-6")}
        >
          {isProcessing ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Tailoring your resume…
            </>
          ) : (
            <>
              <Sparkles className="size-5" />
              Tailor Resume
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
