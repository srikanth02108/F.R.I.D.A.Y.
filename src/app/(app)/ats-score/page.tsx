"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  ChevronDown,
  FileText,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import { AtsScoreLoading } from "@/components/ats-score/ats-score-loading";
import { AtsScoreResults } from "@/components/ats-score/ats-score-results";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  WorkspacePageHeader,
  workspaceAzureButtonClass,
  workspaceCardClass,
  workspaceInputClass,
  workspaceLabelClass,
  workspaceOutlineButtonClass,
  workspacePageClass,
  workspacePrimaryButtonClass,
  workspaceScrollClass,
} from "@/components/workspace/workspace-styles";
import { extractTextFromResumeFile } from "@/lib/extract-resume-text";
import type { AtsScoreResult } from "@/types/ats-score";
import { cn } from "@/lib/utils";

export default function Page() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scoreResult, setScoreResult] = useState<AtsScoreResult | null>(null);
  const [inputTab, setInputTab] = useState("upload");
  const [jdOpen, setJdOpen] = useState(false);

  const hasJobDescription = jobDescription.trim().length > 0;

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      const text = await extractTextFromResumeFile(file);
      setResumeText(text);
      setUploadedFileName(file.name);
      setScoreResult(null);
      toast.success(`Loaded ${file.name}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to read file";
      toast.error(message);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    multiple: false,
    disabled: isLoading,
  });

  const clearUpload = () => {
    setUploadedFileName(null);
    setResumeText("");
    setScoreResult(null);
  };

  const handleCheckScore = async () => {
    if (!resumeText.trim()) {
      toast.error("Add your resume via upload or paste text first");
      return;
    }

    setIsLoading(true);
    setScoreResult(null);

    try {
      const response = await fetch("/api/ats-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: resumeText.trim(),
          jobDescription: jobDescription.trim() || undefined,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | AtsScoreResult
        | { error?: string; details?: string }
        | null;

      if (!response.ok) {
        const message =
          payload && "error" in payload
            ? `${payload.error}${payload.details ? `: ${payload.details}` : ""}`
            : "ATS scoring failed";
        throw new Error(message);
      }

      if (!payload || !("overall_score" in payload)) {
        throw new Error("Invalid ATS score response from server");
      }

      setScoreResult(payload);
      toast.success("ATS score calculated");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "ATS scoring failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={workspacePageClass}>
      <div className={workspaceScrollClass}>
        <WorkspacePageHeader
          badge="Corporate analytics"
          title="ATS Analytics Dashboard"
          description="Authoritative deep-parsing analysis powered by Llama 3.3 70B — token match matrices, format compliance, and prioritized fixes mapped to modern ATS screeners."
        />

        {isLoading ? (
          <AtsScoreLoading />
        ) : (
          <>
            {!scoreResult && (
              <div
                className={cn(
                  workspaceCardClass,
                  "space-y-6 p-6 md:p-8",
                )}
              >
                <Tabs
                  value={inputTab}
                  onValueChange={setInputTab}
                  className="w-full"
                >
                  <TabsList className="grid h-11 w-full grid-cols-2 rounded-lg border border-[#c7c6cb] bg-[#f5f3f3] p-1">
                    <TabsTrigger
                      value="upload"
                      className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[#0A0A0A] data-[state=active]:shadow-sm"
                    >
                      Upload Resume
                    </TabsTrigger>
                    <TabsTrigger
                      value="paste"
                      className="rounded-md data-[state=active]:bg-white data-[state=active]:text-[#0A0A0A] data-[state=active]:shadow-sm"
                    >
                      Paste Text
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="mt-6">
                    <div
                      {...getRootProps()}
                      className={cn(
                        "flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors",
                        isDragActive
                          ? "border-[#2055FD] bg-[#2055FD]/5"
                          : "border-[#c7c6cb] bg-[#fbf9f8] hover:border-[#2055FD]/50 hover:bg-[#2055FD]/5",
                      )}
                    >
                      <input {...getInputProps()} />
                      <Upload className="mb-3 size-10 text-[#2055FD]" />
                      <p className="text-sm font-semibold text-[#0A0A0A]">
                        Drag & drop your resume here
                      </p>
                      <p className="mt-1 text-xs text-[#6B6B6B]">
                        Supports .pdf and .txt files
                      </p>
                    </div>

                    {uploadedFileName && (
                      <div className="mt-4 flex items-center justify-between rounded-lg border border-[#c7c6cb] bg-[#f5f3f3] px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-[#46464b]">
                          <FileText className="size-4 text-[#2055FD]" />
                          <span className="font-medium">{uploadedFileName}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={clearUpload}
                          aria-label="Remove file"
                          className="text-[#6B6B6B] hover:text-[#0A0A0A]"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="paste" className="mt-6">
                    <Label htmlFor="resume-paste" className={workspaceLabelClass}>
                      Resume content
                    </Label>
                    <Textarea
                      id="resume-paste"
                      rows={12}
                      placeholder="Paste your resume content here (plain text or LaTeX)…"
                      value={resumeText}
                      onChange={(e) => {
                        setResumeText(e.target.value);
                        setUploadedFileName(null);
                        setScoreResult(null);
                      }}
                      className={cn(
                        workspaceInputClass,
                        "mt-2 min-h-[280px] resize-y font-mono text-sm",
                      )}
                    />
                  </TabsContent>
                </Tabs>

                <Collapsible open={jdOpen} onOpenChange={setJdOpen}>
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex w-full items-center justify-between rounded-lg border border-[#c7c6cb] bg-[#f5f3f3] px-4 py-3 hover:bg-[#efeded]"
                    >
                      <span className="text-sm font-semibold text-[#0A0A0A]">
                        Target Job Description (Optional)
                      </span>
                      <ChevronDown
                        className={cn(
                          "size-4 text-[#6B6B6B] transition-transform",
                          jdOpen && "rotate-180",
                        )}
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <Textarea
                      rows={6}
                      placeholder="Paste the job description to enable keyword match scoring…"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className={cn(workspaceInputClass, "resize-y")}
                    />
                  </CollapsibleContent>
                </Collapsible>

                <Button
                  type="button"
                  size="lg"
                  className={cn(workspacePrimaryButtonClass, "mt-2 w-full")}
                  onClick={handleCheckScore}
                  disabled={!resumeText.trim()}
                >
                  Check ATS Score
                </Button>
              </div>
            )}

            {scoreResult && (
              <AtsScoreResults
                result={scoreResult}
                hasJobDescription={hasJobDescription}
                onRunAnother={() => setScoreResult(null)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
