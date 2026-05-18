"use client";

import { usePathname } from "next/navigation";

import { PlanActionButton } from "@/components/layout/plan-action-button";
import { getPageTitle } from "@/lib/navigation";

export function AppTopBar() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-900 dark:bg-zinc-950 md:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 md:text-4xl dark:text-zinc-50">
        {title}
      </h1>
      <PlanActionButton />
    </header>
  );
}
