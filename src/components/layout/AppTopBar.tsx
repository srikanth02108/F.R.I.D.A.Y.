"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getPageTitle } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function AppTopBar() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950 md:px-8">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl dark:text-zinc-50">
        {title}
      </h1>
      <Button
        size="sm"
        asChild
        className={cn(
          "border-0 bg-gradient-to-r from-amber-500 to-orange-600 font-semibold text-white shadow-md transition-all duration-200 hover:brightness-110",
        )}
      >
        <Link href="/pricing/pro">Upgrade to Pro</Link>
      </Button>
    </header>
  );
}
