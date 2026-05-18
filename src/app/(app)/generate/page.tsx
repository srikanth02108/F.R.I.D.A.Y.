"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  CloudUpload,
  FileText,
  Lightbulb,
  ListChecks,
  Loader2,
  Sparkles,
  Target,
  Wand2,
} from "lucide-react";
import toast from "react-hot-toast";

import { useUserPlan } from "@/components/providers/user-plan-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  WorkspacePageHeader,
  WorkspaceSectionLabel,
  workspaceAzureButtonClass,
  workspaceCardClass,
  workspaceInputClass,
  workspaceLabelClass,
  workspaceOutlineButtonClass,
  workspacePageClass,
  workspacePrimaryButtonClass,
  workspaceScrollClass,
} from "@/components/workspace/workspace-styles";
import { compileLatexToPdfBlob } from "@/lib/compile-latex";
import { createEmptyResumeContent } from "@/lib/resume-content";
import { sanitizeGeneratedLatex } from "@/lib/sanitize-latex";
import { createClient } from "@/lib/supabase/client";
import { streamGenerateResume } from "@/lib/stream-generate-resume";
import { useTemplates } from "@/hooks/use-templates";
import type { UserProfile } from "@/types/database";
import { cn } from "@/lib/utils";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 items-center justify-center bg-[#1e1e1e] text-sm text-[#82838b]">
      Loading editor…
    </div>
  ),
});

const DEFAULT_TEMPLATE = "classic";
const AI_RESUME_TITLE = "AI Generated Resume";

const TIPS = [
  { icon: Target, text: "Mention metrics and scale where possible" },
  { icon: ListChecks, text: "List your primary stack clearly" },
  { icon: Lightbulb, text: "Specify your target job role" },
] as const;

function ProgressStep({
  step,
  label,
  active,
  complete,
}: {
  step: number;
  label: string;
  active: boolean;
  complete: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3",
        !active && !complete && "opacity-60",
      )}
    >
      <div
        className={cn(
          "flex size-8 items-center justify-center rounded-full font-mono text-[13px] font-bold",
          complete || active
            ? "bg-[#2055FD] text-white shadow-[0_0_15px_rgba(32,85,253,0.3)]"
            : "bg-[#e9e8e7] text-[#6B6B6B]",
        )}
      >
        {complete ? <Check className="size-4" /> : step}
      </div>
      <span
        className={cn(
          "text-lg font-semibold",
          active || complete ? "text-[#0A0A0A]" : "text-[#6B6B6B]",
        )}
      >
        {label}
      </span>
    </div>
  );
}

export default function Page() {
  const router = useRouter();
  const { canRunAiGeneration, canUseProModels } = useUserPlan();

  const [description, setDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(DEFAULT_TEMPLATE);
  const [loadProfileToggle, setLoadProfileToggle] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLatex, setGeneratedLatex] = useState("");
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  const [isCompiling, setIsCompiling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const pdfUrlRef = useRef<string | null>(null);
  const { templates, getLatex } = useTemplates();
  const selectedTemplateMeta = templates.find((t) => t.id === selectedTemplate);

  const isComplete = generatedLatex.length > 0 && !isGenerating;
  const isBusy = isGenerating || isCompiling || isSaving;
  const stepInput = !isGenerating && !isComplete;
  const stepProcessing = isGenerating;
  const stepPreview = isComplete;

  useEffect(() => {
    return () => {
      if (pdfUrlRef.current) {
        URL.revokeObjectURL(pdfUrlRef.current);
      }
    };
  }, []);

  const fetchUserProfile = async (): Promise<Record<string, unknown>> => {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("You must be signed in to generate a resume");
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      toast.error(`Could not load profile: ${error.message}`);
      return { id: user.id, email: user.email ?? "" };
    }

    if (!data) {
      return { id: user.id, email: user.email ?? "" };
    }

    return data as UserProfile;
  };

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error("Please describe your background first");
      return;
    }

    if (!canRunAiGeneration) {
      toast.error(
        "You have reached your free generation limit. Upgrade to Pro for unlimited AI generations.",
      );
      router.push("/pricing/pro");
      return;
    }

    if (!canUseProModels) {
      toast(
        "Using standard AI model on Free plan. Upgrade to Pro for advanced Llama 3.3 70B.",
        { icon: "✨" },
      );
    }

    setIsGenerating(true);
    setGeneratedLatex("");
    if (pdfUrlRef.current) {
      URL.revokeObjectURL(pdfUrlRef.current);
      pdfUrlRef.current = null;
    }
    setPdfBlobUrl(null);

    try {
      let userProfile: Record<string, unknown> = {};

      if (loadProfileToggle) {
        userProfile = await fetchUserProfile();
      } else {
        const supabase = createClient();
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error("You must be signed in to generate a resume");
        }

        userProfile = { id: user.id, email: user.email ?? "" };
      }

      let accumulated = "";

      const templateCode = getLatex(selectedTemplate);

      await streamGenerateResume(
        {
          description: description.trim(),
          template: selectedTemplate,
          templateCode: templateCode,
          userProfile,
        },
        (chunk) => {
          accumulated += chunk;
          setGeneratedLatex(sanitizeGeneratedLatex(accumulated));
        },
      );

      setGeneratedLatex(sanitizeGeneratedLatex(accumulated));

      if (!accumulated.trim()) {
        throw new Error("Groq returned an empty response. Please try again.");
      }

      toast.success("Resume generated with Groq AI");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Generation failed";
      toast.error(message);
      setGeneratedLatex("");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenInEditor = async () => {
    if (!generatedLatex.trim()) {
      toast.error("Generate a resume first");
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
        throw new Error("You must be signed in to save");
      }

      const latex = sanitizeGeneratedLatex(generatedLatex);

      const { data, error } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          name: AI_RESUME_TITLE,
          template: selectedTemplate,
          slug: null,
          content: createEmptyResumeContent(latex),
          ats_score: null,
          is_public: false,
        })
        .select("id")
        .single();

      if (error) throw new Error(error.message);
      if (!data) throw new Error("Failed to save resume");

      toast.success("Opening in editor…");
      router.push(`/app/editor?id=${data.id}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save resume";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompilePreview = async () => {
    if (!generatedLatex.trim()) {
      toast.error("Generate a resume first");
      return;
    }

    setIsCompiling(true);

    try {
      const blob = await compileLatexToPdfBlob(
        sanitizeGeneratedLatex(generatedLatex),
      );

      // Revoke old URL before creating a new one
      if (pdfUrlRef.current) {
        URL.revokeObjectURL(pdfUrlRef.current);
        pdfUrlRef.current = null;
      }

      // Guarantee correct MIME type so the browser renders it as a PDF
      const pdfBlob =
        blob.type === "application/pdf"
          ? blob
          : new Blob([blob], { type: "application/pdf" });

      const url = URL.createObjectURL(pdfBlob);
      pdfUrlRef.current = url;
      setPdfBlobUrl(url);
      toast.success("PDF preview ready");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Compilation failed";
      toast.error(message);
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div className={cn(workspacePageClass, "relative")}>
      <div className={cn(workspaceScrollClass, "pb-28")}>
        <WorkspacePageHeader
          badge="AI Hub Engine"
          title="Resume Generation Hub"
          description="Initialize your career vector. Describe your background and let Groq AI engineer your complete LaTeX resume."
        />

        <div className="mb-8 flex flex-col gap-4 overflow-x-auto md:flex-row md:items-center">
          <ProgressStep
            step={1}
            label="Input Source"
            active={stepInput}
            complete={stepProcessing || stepPreview}
          />
          <div className="hidden h-0.5 min-w-8 flex-1 bg-[#c7c6cb] md:block" />
          <ProgressStep
            step={2}
            label="AI Processing"
            active={stepProcessing}
            complete={stepPreview}
          />
          <div className="hidden h-0.5 min-w-8 flex-1 bg-[#c7c6cb] md:block" />
          <ProgressStep
            step={3}
            label="Preview & Refine"
            active={stepPreview}
            complete={false}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-6">
          <div className="flex flex-col gap-6 lg:col-span-8">
            <div className={cn(workspaceCardClass, "relative overflow-hidden p-6 md:p-8")}>
              <CloudUpload className="absolute top-4 right-4 size-24 text-[#2055FD]/5" />
              <h3 className="mb-2 text-xl font-semibold text-[#0A0A0A]">
                Tell us about yourself
              </h3>
              <p className="mb-6 text-sm text-[#6B6B6B]">
                Our semantic engine uses your narrative to build a high-signal
                LaTeX resume via Groq AI.
              </p>

              <div className="space-y-2">
                <Label htmlFor="description" className={workspaceLabelClass}>
                  Background & experience
                </Label>
                <Textarea
                  id="description"
                  rows={8}
                  placeholder="E.g. I'm a 2024 Computer Science graduate from VIT. I did an internship at a startup where I built a REST API. I'm good at Python, React, and SQL. Looking for backend developer roles."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isBusy}
                  className={cn(workspaceInputClass, "min-h-[200px] resize-none")}
                />
              </div>

              <div className="mt-6 flex flex-col gap-4 rounded-lg border border-[#c7c6cb] bg-[#f5f3f3] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Label htmlFor="load-profile" className="text-sm font-semibold text-[#0A0A0A]">
                    Load from My Profile
                  </Label>
                  <p className="text-xs text-[#6B6B6B]">
                    Include Supabase profile data in the Groq prompt
                  </p>
                </div>
                <Switch
                  id="load-profile"
                  checked={loadProfileToggle}
                  onCheckedChange={setLoadProfileToggle}
                  disabled={isBusy}
                />
              </div>

              <div className="mt-4 rounded-lg border border-dashed border-[#c7c6cb] bg-[#fbf9f8] p-6 text-center">
                <CloudUpload className="mx-auto mb-3 size-8 text-[#2055FD]" />
                <p className="text-sm font-semibold text-[#0A0A0A]">
                  Document upload coming soon
                </p>
                <p className="mt-1 text-xs text-[#6B6B6B]">
                  PDF, DOCX, or LinkedIn archive — use manual entry for now
                </p>
              </div>
            </div>

            <Card className={cn(workspaceCardClass, "border-0 shadow-none")}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-[#0A0A0A]">
                  Pro-Tips for Better Generation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {TIPS.map((tip) => {
                  const Icon = tip.icon;
                  return (
                    <div
                      key={tip.text}
                      className="flex items-start gap-2 text-sm text-[#46464b]"
                    >
                      <Icon className="mt-0.5 size-4 shrink-0 text-[#2055FD]" />
                      <span>{tip.text}</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4">
            <div className={cn(workspaceCardClass, "flex h-full flex-col p-6")}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#0A0A0A]">
                  Output Architecture
                </h3>
                <Wand2 className="size-5 text-[#6B6B6B]" />
              </div>
              <p className="mb-6 text-sm text-[#6B6B6B]">
                Select the LaTeX template for compilation style and visual
                hierarchy.
              </p>

              <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto pr-1">
                {templates.map((template) => {
                  const isSelected = selectedTemplate === template.id;
                  return (
                    <button
                      key={template.id}
                      type="button"
                      disabled={isBusy}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={cn(
                        "relative rounded-lg border p-3 text-left transition-all",
                        isSelected
                          ? "border-2 border-[#2055FD] bg-white shadow-[0_4px_15px_rgba(32,85,253,0.08)]"
                          : "border-[#c7c6cb] bg-white hover:border-[#77777c]",
                      )}
                    >
                      {isSelected ? (
                        <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-[#2055FD]">
                          <Check className="size-3 text-white" />
                        </span>
                      ) : null}
                      <div className="mb-3 h-20 overflow-hidden rounded border border-[#e9e8e7] bg-[#efeded]" />
                      <h4 className="text-base font-semibold text-[#0A0A0A]">
                        {template.name}
                      </h4>
                      {template.id === selectedTemplate &&
                      selectedTemplateMeta ? (
                        <p className="mt-1 text-xs text-[#6B6B6B]">
                          {selectedTemplateMeta.description}
                        </p>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <WorkspaceSectionLabel>Generated output</WorkspaceSectionLabel>
          <div
            className={cn(
              workspaceCardClass,
              "min-h-[360px] overflow-hidden",
              isGenerating && "border-2 border-[#2055FD]/40",
            )}
          >
            {!generatedLatex && !isGenerating ? (
              <div className="flex h-[360px] flex-col items-center justify-center p-8 text-center">
                <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-[#2055FD]/10">
                  <Sparkles className="size-8 text-[#2055FD]" />
                </div>
                <p className="max-w-sm text-sm text-[#6B6B6B]">
                  Your generated resume will stream here after you initialize
                  the AI engine.
                </p>
              </div>
            ) : isGenerating ? (
              <pre className="h-[360px] overflow-auto bg-[#0A0A0A] p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-[#f5f3f3]">
                {generatedLatex || " "}
              </pre>
            ) : (
              <div className="h-[360px]">
                <MonacoEditor
                  height="100%"
                  language="latex"
                  theme="vs-dark"
                  value={generatedLatex}
                  options={{
                    readOnly: true,
                    wordWrap: "on",
                    fontSize: 13,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 12 },
                  }}
                />
              </div>
            )}

            {isComplete ? (
              <div className="flex flex-wrap gap-3 border-t border-[#e9e8e7] bg-[#f5f3f3] p-4">
                <Button
                  className={workspacePrimaryButtonClass}
                  onClick={handleOpenInEditor}
                  disabled={isBusy}
                >
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <FileText className="size-4" />
                  )}
                  Open in Editor
                </Button>
                <Button
                  variant="outline"
                  className={workspaceOutlineButtonClass}
                  onClick={handleCompilePreview}
                  disabled={isBusy}
                >
                  {isCompiling ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : null}
                  Compile Preview
                </Button>
              </div>
            ) : null}
          </div>

          {pdfBlobUrl ? (
            <iframe
              key={pdfBlobUrl}
              title="Compiled resume preview"
              src={pdfBlobUrl}
              className="mt-4 h-[min(600px,50vh)] w-full rounded-xl border border-[#c7c6cb] bg-white shadow-sm"
            />
          ) : null}
        </div>
      </div>

      <div className="fixed right-0 bottom-0 left-0 z-40 flex items-center justify-end gap-3 border-t border-[#c7c6cb] bg-white/90 px-4 py-4 backdrop-blur-md md:left-60">
        <Button
          variant="ghost"
          className="text-[#6B6B6B] hover:text-[#0A0A0A]"
          disabled={isBusy}
          onClick={() => {
            setDescription("");
            setGeneratedLatex("");
          }}
        >
          Clear session
        </Button>
        <Button
          type="button"
          size="lg"
          disabled={isBusy || !description.trim()}
          onClick={handleGenerate}
          className={cn(workspacePrimaryButtonClass, "gap-2 px-8")}
        >
          {isGenerating ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Initializing…
            </>
          ) : (
            <>
              <Sparkles className="size-5 text-[#2055FD]" />
              Initialize AI Engine
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
