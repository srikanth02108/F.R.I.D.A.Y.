"use client";

import { cn } from "@/lib/utils";

export const workspacePageClass =
  "flex min-h-0 flex-1 flex-col overflow-hidden bg-[#f5f3f3] text-[#1b1c1c] dark:bg-zinc-950 dark:text-zinc-50";

export const workspaceScrollClass =
  "min-h-0 flex-1 overflow-y-auto p-4 md:p-8 lg:p-10";

export const workspaceCardClass =
  "rounded-xl border border-[#c7c6cb] bg-white text-zinc-900 shadow-[0px_4px_20px_rgba(15,17,23,0.04)] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:shadow-none";

/** Resume before/after panels — deep neutral blend in dark mode */
export const tailorResumePanelClass =
  "rounded-xl border border-zinc-200 bg-white text-zinc-900 shadow-[0px_4px_20px_rgba(15,17,23,0.04)] dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:shadow-none";

export const workspaceLabelClass =
  "font-mono text-[13px] font-medium tracking-[0.05em] text-[#46464b] uppercase dark:text-zinc-400";

export const workspaceInputClass =
  "rounded-lg border-[#c7c6cb] bg-white text-[#1b1c1c] shadow-sm placeholder:text-[#77777c] focus-visible:border-[#2055FD] focus-visible:ring-4 focus-visible:ring-[#2055FD]/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus-visible:border-violet-500 dark:focus-visible:ring-violet-500/20";

export const workspacePrimaryButtonClass =
  "rounded-lg bg-[#0A0A0A] text-[15px] font-semibold text-white shadow-sm hover:bg-[#191b22] dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white";

export const workspaceAzureButtonClass =
  "rounded-lg bg-[#2055FD] text-[15px] font-semibold text-white shadow-sm hover:bg-[#2558ff] dark:bg-violet-600 dark:hover:bg-violet-500";

export const workspaceOutlineButtonClass =
  "rounded-lg border-[#c7c6cb] bg-white text-[15px] font-semibold text-[#1b1c1c] shadow-sm hover:border-[#2055FD] hover:text-[#2055FD] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:border-violet-500 dark:hover:text-violet-400";

export function WorkspaceSectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn(workspaceLabelClass, "mb-2", className)}>{children}</h3>
  );
}

export function WorkspacePageHeader({
  badge,
  title,
  description,
  children,
}: {
  badge?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
      <div>
        {badge ? (
          <span className="mb-2 inline-flex rounded-full border border-[#2055FD]/20 bg-[#2055FD]/10 px-3 py-1 font-mono text-[13px] font-medium tracking-[0.05em] text-[#2055FD] uppercase dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300">
            {badge}
          </span>
        ) : null}
        <h2 className="text-[28px] font-bold tracking-tight text-[#0A0A0A] md:text-[32px] md:leading-10 dark:text-zinc-50">
          {title}
        </h2>
        <p className="mt-1 max-w-2xl text-base text-[#6B6B6B] dark:text-zinc-400">
          {description}
        </p>
      </div>
      {children ? (
        <div className="flex shrink-0 flex-wrap gap-2">{children}</div>
      ) : null}
    </header>
  );
}
