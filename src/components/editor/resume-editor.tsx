"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import {
  CheckCircle2,
  Copy,
  Download,
  FileText,
  GripVertical,
  Loader2,
  Play,
  Save,
  Share2,
  User,
  Wand2,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  workspaceAzureButtonClass,
  workspaceLabelClass,
  workspaceOutlineButtonClass,
  workspacePrimaryButtonClass,
} from "@/components/workspace/workspace-styles";
import {
  compileLatexToPdfBlob,
  downloadPdfBlob,
  sanitizeResumeFilename,
} from "@/lib/compile-latex";
import { createClient } from "@/lib/supabase/client";
import { createEmptyResumeContent } from "@/lib/resume-content";
import { getTemplateLatex, TEMPLATES } from "@/lib/templates";
import type { Resume } from "@/types/database";
import { cn } from "@/lib/utils";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-[#1e1e1e] text-sm text-slate-400">
      Loading editor…
    </div>
  ),
});

const DEFAULT_TEMPLATE_ID = "classic";
const MIN_PANEL_PERCENT = 25;
const MAX_PANEL_PERCENT = 75;

function createDefaultLatex() {
  return getTemplateLatex(DEFAULT_TEMPLATE_ID) ?? "";
}

export function ResumeEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeIdParam = searchParams.get("id");

  const [latexContent, setLatexContent] = useState(createDefaultLatex);
  const [selectedTemplate, setSelectedTemplate] = useState(DEFAULT_TEMPLATE_ID);
  const [resumeName, setResumeName] = useState("My Resume");
  const [resumeId, setResumeId] = useState<string | null>(resumeIdParam);

  const [savedLatex, setSavedLatex] = useState(createDefaultLatex);
  const [savedName, setSavedName] = useState("My Resume");
  const [savedTemplate, setSavedTemplate] = useState(DEFAULT_TEMPLATE_ID);

  const [leftPanelPercent, setLeftPanelPercent] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const [compiling, setCompiling] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [copying, setCopying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingResume, setLoadingResume] = useState(Boolean(resumeIdParam));

  const isBusy = compiling || exporting || copying || saving;

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [lastCompiled, setLastCompiled] = useState<Date | null>(null);

  const [pendingTemplate, setPendingTemplate] = useState<string | null>(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const pdfUrlRef = useRef<string | null>(null);

  const isDirty =
    latexContent !== savedLatex ||
    resumeName !== savedName ||
    selectedTemplate !== savedTemplate;

  const applyTemplate = useCallback((templateId: string) => {
    const latex = getTemplateLatex(templateId);
    if (!latex) return;
    setLatexContent(latex);
    setSelectedTemplate(templateId);
  }, []);

  const loadResume = useCallback(async () => {
    if (!resumeIdParam) {
      setLoadingResume(false);
      return;
    }

    setLoadingResume(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeIdParam)
      .single();

    setLoadingResume(false);

    if (error || !data) {
      toast.error(error?.message ?? "Resume not found");
      return;
    }

    const resume = data as Resume;
    const latex =
      resume.content?.latexSource ??
      getTemplateLatex(resume.template) ??
      createDefaultLatex();

    setResumeId(resume.id);
    setResumeName(resume.title);
    setSelectedTemplate(resume.template);
    setLatexContent(latex);
    setSavedLatex(latex);
    setSavedName(resume.title);
    setSavedTemplate(resume.template);
  }, [resumeIdParam]);

  useEffect(() => {
    loadResume();
  }, [loadResume]);

  useEffect(() => {
    return () => {
      if (pdfUrlRef.current) {
        URL.revokeObjectURL(pdfUrlRef.current);
      }
    };
  }, []);

  const handleTemplateChange = (templateId: string) => {
    if (templateId === selectedTemplate) return;

    if (isDirty) {
      setPendingTemplate(templateId);
      setTemplateDialogOpen(true);
      return;
    }

    applyTemplate(templateId);
  };

  const confirmTemplateChange = () => {
    if (pendingTemplate) {
      applyTemplate(pendingTemplate);
    }
    setPendingTemplate(null);
    setTemplateDialogOpen(false);
  };

  const handleDividerMouseDown = () => setIsDragging(true);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (event: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const percent = ((event.clientX - rect.left) / rect.width) * 100;
      setLeftPanelPercent(
        Math.min(MAX_PANEL_PERCENT, Math.max(MIN_PANEL_PERCENT, percent)),
      );
    };

    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const setPreviewFromBlob = useCallback((blob: Blob) => {
    if (pdfUrlRef.current) {
      URL.revokeObjectURL(pdfUrlRef.current);
    }

    const url = URL.createObjectURL(blob);
    pdfUrlRef.current = url;
    setPdfUrl(url);
    setLastCompiled(new Date());
  }, []);

  const handleCompile = async () => {
    setCompiling(true);

    try {
      const blob = await compileLatexToPdfBlob(latexContent);
      setPreviewFromBlob(blob);
      toast.success("Resume compiled successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Compilation failed";
      toast.error(message);
    } finally {
      setCompiling(false);
    }
  };

  const handleExportPdf = async () => {
    setExporting(true);

    try {
      const blob = await compileLatexToPdfBlob(latexContent);
      downloadPdfBlob(blob, sanitizeResumeFilename(resumeName));
      setPreviewFromBlob(blob);
      toast.success("PDF downloaded");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "PDF export failed";
      toast.error(message);
    } finally {
      setExporting(false);
    }
  };

  const handleCopyLatex = async () => {
    setCopying(true);

    try {
      await navigator.clipboard.writeText(latexContent);
      toast.success("LaTeX copied to clipboard");
    } catch {
      toast.error("Failed to copy LaTeX to clipboard");
    } finally {
      setCopying(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setSaving(false);
      toast.error("You must be signed in to save");
      router.push("/auth/login");
      return;
    }

    const resumeFields = {
      title: resumeName.trim() || "My Resume",
      template: selectedTemplate,
      slug: null,
      content: createEmptyResumeContent(latexContent),
      ats_score: null,
      is_public: false,
    };

    let errorMessage: string | null = null;

    if (resumeId) {
      const { error } = await supabase
        .from("resumes")
        .update(resumeFields)
        .eq("id", resumeId)
        .eq("user_id", user.id);

      if (error) errorMessage = error.message;
    } else {
      const { data, error } = await supabase
        .from("resumes")
        .insert({ ...resumeFields, user_id: user.id })
        .select("id")
        .single();

      if (error) {
        errorMessage = error.message;
      } else if (data) {
        setResumeId(data.id);
        router.replace(`/app/editor?id=${data.id}`, { scroll: false });
      }
    }

    setSaving(false);

    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    setSavedLatex(latexContent);
    setSavedName(resumeName);
    setSavedTemplate(selectedTemplate);
    toast.success("Resume saved");
  };

  const handleLoadMyInfo = () => {
    toast("Load My Info coming soon", { icon: "ℹ️" });
  };

  if (loadingResume) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-[#f5f3f3]">
        <Loader2 className="size-6 animate-spin text-[#2055FD]" />
      </div>
    );
  }

  return (
    <>
      <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden bg-[#f5f3f3]">
        <header className="z-10 flex h-16 shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[#e9e8e7] bg-white px-4 shadow-sm md:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <FileText className="size-5 shrink-0 text-[#6B6B6B]" />
            <Input
              value={resumeName}
              onChange={(e) => setResumeName(e.target.value)}
              className="h-9 max-w-[min(100%,280px)] border-transparent bg-transparent px-0 text-base font-bold text-[#0A0A0A] shadow-none focus-visible:border-[#c7c6cb] focus-visible:ring-2 focus-visible:ring-[#2055FD]/10"
              placeholder="Resume name"
            />
            <span
              className={cn(
                "shrink-0 rounded px-2 py-1 font-mono text-[11px] tracking-wider uppercase",
                isDirty
                  ? "bg-amber-50 text-amber-800"
                  : "bg-[#efeded] text-[#46464b]",
              )}
            >
              {isDirty ? "Unsaved" : "Saved"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={selectedTemplate}
              onValueChange={handleTemplateChange}
              disabled={isBusy}
            >
              <SelectTrigger
                className="h-9 w-[130px] border-[#c7c6cb] bg-white text-sm md:w-[150px]"
                size="sm"
              >
                <SelectValue placeholder="Template" />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATES.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              className={cn("hidden sm:inline-flex", workspaceOutlineButtonClass)}
              onClick={handleLoadMyInfo}
              disabled={isBusy}
            >
              <User className="size-3.5" />
              Load My Info
            </Button>

            <Button
              variant="outline"
              size="sm"
              className={cn("hidden md:inline-flex", workspaceOutlineButtonClass)}
              onClick={handleCopyLatex}
              disabled={isBusy}
            >
              {copying ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Copy className="size-3.5" />
              )}
              Copy LaTeX
            </Button>

            <Button
              size="sm"
              className={cn(workspaceOutlineButtonClass)}
              onClick={handleSave}
              disabled={isBusy}
            >
              {saving ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              Save
            </Button>

            <Button
              variant="outline"
              size="sm"
              className={cn("hidden lg:inline-flex", workspaceOutlineButtonClass)}
              disabled={isBusy}
              onClick={() => toast("Share link coming soon", { icon: "ℹ️" })}
            >
              <Share2 className="size-3.5" />
              Share
            </Button>

            <Button
              size="sm"
              className={cn(workspaceAzureButtonClass)}
              onClick={handleExportPdf}
              disabled={isBusy}
            >
              {exporting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Download className="size-3.5" />
              )}
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>

            <Button size="sm" className={cn(workspacePrimaryButtonClass)} asChild>
              <Link href="/app/tailor">
                <Wand2 className="size-3.5" />
                <span className="hidden sm:inline">Tailor for Job</span>
                <span className="sm:hidden">Tailor</span>
              </Link>
            </Button>
          </div>
        </header>

        <div
          ref={containerRef}
          className={cn(
            "flex min-h-0 flex-1 overflow-hidden",
            isDragging && "cursor-col-resize select-none",
          )}
        >
          <div
            className="flex min-w-0 flex-col border-r border-[#e9e8e7] bg-[#0A0A0A]"
            style={{ width: `${leftPanelPercent}%` }}
          >
            <div className="flex h-10 shrink-0 items-center justify-between border-b border-[#191b22] bg-[#151515] px-4">
              <span className={cn(workspaceLabelClass, "text-[12px] text-[#82838b]")}>
                monaco-editor (LaTeX)
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-[#c5c6ce] hover:bg-[#191b22] hover:text-white"
                onClick={handleCompile}
                disabled={isBusy}
              >
                {compiling ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Play className="size-3" />
                )}
                Compile
              </Button>
            </div>

            <div className="min-h-0 flex-1">
              <MonacoEditor
                height="100%"
                language="latex"
                theme="vs-dark"
                value={latexContent}
                onChange={(value) => setLatexContent(value ?? "")}
                options={{
                  wordWrap: "on",
                  fontSize: 13,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 12 },
                }}
              />
            </div>
          </div>

          <button
            type="button"
            aria-label="Resize panels"
            onMouseDown={handleDividerMouseDown}
            className={cn(
              "flex w-1.5 shrink-0 cursor-col-resize items-center justify-center bg-[#e9e8e7] transition-colors hover:bg-[#2055FD]/40",
              isDragging && "bg-[#2055FD]",
            )}
          >
            <GripVertical className="size-3 text-[#77777c]" />
          </button>

          <div
            className="relative flex min-w-0 flex-1 flex-col bg-[#efeded]"
            style={{ width: `${100 - leftPanelPercent}%` }}
          >
            {pdfUrl ? (
              <div className="absolute top-4 right-4 z-20 hidden w-72 rounded-xl border border-[#e9e8e7] bg-white/90 p-4 shadow-[0px_4px_20px_rgba(15,17,23,0.08)] backdrop-blur-xl sm:block">
                <div className="mb-3 flex items-center justify-between">
                  <span className={cn(workspaceLabelClass, "text-[#6B6B6B]")}>
                    Preview Status
                  </span>
                  <div className="flex items-center gap-1 text-[#0EB87A]">
                    <CheckCircle2 className="size-4" />
                    <span className="text-sm font-bold">Ready</span>
                  </div>
                </div>
                <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-[#efeded]">
                  <div className="h-full w-full rounded-full bg-[#0EB87A]" />
                </div>
                <p className="text-xs text-[#6B6B6B]">
                  {lastCompiled
                    ? `Compiled ${format(lastCompiled, "h:mm a")}`
                    : "PDF preview active"}
                </p>
              </div>
            ) : null}

            <div className="min-h-0 flex-1 overflow-auto p-4 md:p-6">
              {!pdfUrl ? (
                <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#c7c6cb] bg-white text-center">
                  <FileText className="mb-3 size-10 text-[#77777c]" />
                  <p className="max-w-xs text-sm text-[#6B6B6B]">
                    Click Compile to render your LaTeX resume as a live PDF
                    preview.
                  </p>
                  <Button
                    className={cn("mt-4", workspaceAzureButtonClass)}
                    size="sm"
                    onClick={handleCompile}
                    disabled={isBusy}
                  >
                    {compiling ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Play className="size-3.5" />
                    )}
                    Compile & Preview
                  </Button>
                </div>
              ) : (
                <iframe
                  title="Resume preview"
                  src={pdfUrl}
                  className="mx-auto h-full min-h-[600px] w-full max-w-3xl rounded-sm border border-[#e9e8e7] bg-white shadow-[0px_10px_30px_rgba(0,0,0,0.1)]"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="border-[#c7c6cb] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Switch template?</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Switching templates will replace your
              current LaTeX with the selected template.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className={workspaceOutlineButtonClass}
              onClick={() => {
                setPendingTemplate(null);
                setTemplateDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              className={workspacePrimaryButtonClass}
              onClick={confirmTemplateChange}
            >
              Switch template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
