"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FileText, Loader2, Shield } from "lucide-react";

import { FridayLogo } from "@/components/brand/friday-logo";

type ShareMeta = {
  id: string;
  name: string;
  template: string;
  updated_at: string;
};

export default function SharedResumePage() {
  const params = useParams<{ resumeId: string }>();
  const resumeId = params.resumeId;

  const [meta, setMeta] = useState<ShareMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const pdfUrl = resumeId ? `/api/share/${resumeId}/pdf` : null;

  const loadMeta = useCallback(async () => {
    if (!resumeId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/share/${resumeId}`);
      const payload = (await response.json().catch(() => null)) as
        | ShareMeta
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(
          payload && "error" in payload && payload.error
            ? payload.error
            : "This shared resume is unavailable",
        );
      }

      setMeta(payload as ShareMeta);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load shared resume",
      );
    } finally {
      setLoading(false);
    }
  }, [resumeId]);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f3f3]">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#e9e8e7] bg-white px-4 md:px-8">
        <ShareHeaderBrand />
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 md:px-8 md:py-10">
        {loading ? (
          <ShareStatePanel>
            <Loader2 className="size-8 animate-spin text-[#2055FD]" />
            <p className="mt-4 text-sm text-[#6B6B6B]">Loading shared resume…</p>
          </ShareStatePanel>
        ) : error ? (
          <ShareStatePanel>
            <FileText className="mb-3 size-10 text-[#77777c]" />
            <h1 className="text-lg font-semibold text-[#0A0A0A]">
              Resume unavailable
            </h1>
            <p className="mt-2 max-w-md text-center text-sm text-[#6B6B6B]">
              {error}
            </p>
          </ShareStatePanel>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#e9e8e7] bg-white px-4 py-3">
              <Shield className="size-4 shrink-0 text-[#2055FD]" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#0A0A0A]">
                  {meta?.name ?? "Resume"}
                </p>
                <p className="text-xs text-[#6B6B6B]">
                  Read-only preview for recruiters — editing is disabled.
                </p>
              </div>
            </div>

            {pdfUrl ? (
              <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-[#e9e8e7] bg-white shadow-[0px_10px_30px_rgba(0,0,0,0.08)]">
                <iframe
                  title={`${meta?.name ?? "Resume"} PDF preview`}
                  src={pdfUrl}
                  className="h-[min(85vh,1100px)] w-full"
                />
              </div>
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}

function ShareStatePanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-24">
      {children}
    </div>
  );
}

function ShareHeaderBrand() {
  return (
    <div className="flex items-center gap-3">
      <FridayLogo size={28} />
      <span className="text-sm font-semibold text-[#0A0A0A]">Shared Resume</span>
    </div>
  );
}
