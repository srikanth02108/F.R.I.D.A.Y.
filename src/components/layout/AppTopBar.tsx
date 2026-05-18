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
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-900 dark:bg-zinc-950 md:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 md:text-4xl dark:text-zinc-50">
        {title}
      </h1>
      <Button
        size="sm"
        asChild
        className={cn(
          "border-0 bg-gradient-to-r from-amber-500 to-orange-500 font-bold text-white shadow-lg transition-all duration-200 hover:brightness-110",
        )}
      >
        <Link href="/pricing">Upgrade to Pro</Link>
      </Button>
    </header>
  );
}
