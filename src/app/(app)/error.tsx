"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

type AppErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppError({ error, reset }: AppErrorProps) {
  const router = useRouter();

  useEffect(() => {
    console.error("[AppErrorBoundary]", {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
        <AlertTriangle className="size-7" />
      </div>
      <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">
        Something slipped up in the engine.
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        An unexpected error interrupted this view. You can retry the last action
        or return to your workspace dashboard.
      </p>
      {error.digest ? (
        <p className="mt-3 font-mono text-xs text-slate-400">
          Reference: {error.digest}
        </p>
      ) : null}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          type="button"
          className="bg-violet-600 text-white hover:bg-violet-700"
          onClick={() => reset()}
        >
          Try Again
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/app/dashboard")}
        >
          Go back to Dashboard
        </Button>
      </div>
    </div>
  );
}
