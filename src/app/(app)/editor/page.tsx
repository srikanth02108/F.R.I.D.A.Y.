import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { ResumeEditor } from "@/components/editor/resume-editor";

export const metadata: Metadata = {
  title: "Advanced LaTeX Resume Editor | Tailor Your Resume",
  description:
    "Edit LaTeX resume source with live preview and Supabase persistence.",
};

function EditorLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <Loader2 className="size-6 animate-spin text-violet-600" />
    </div>
  );
}

export default function EditorPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <Suspense fallback={<EditorLoading />}>
        <ResumeEditor />
      </Suspense>
    </div>
  );
}
