"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";

import { LandingThemeToggle } from "@/components/landing/landing-theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BRAND_ACRONYM } from "@/lib/brand";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
] as const;

function BrandMark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "text-lg font-extrabold tracking-tight text-[#0A0A0A] dark:text-white sm:text-xl",
        className,
      )}
    >
      {BRAND_ACRONYM}
    </Link>
  );
}

export function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 border-b border-[#e9e8e7] bg-white/80 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:h-[4.5rem]">
        <div className="flex min-w-0 items-center gap-4 md:gap-8">
          <BrandMark />

          <div className="hidden items-center gap-6 md:flex lg:gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[15px] text-[#46464b] transition-colors hover:text-[#2055FD] dark:text-slate-300 dark:hover:text-violet-400"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LandingThemeToggle className="shrink-0" />

          <Button
            variant="ghost"
            asChild
            className="hidden text-[#2055FD] hover:bg-[#2055FD]/10 hover:text-[#2055FD] sm:inline-flex dark:text-violet-400 dark:hover:bg-violet-500/10"
          >
            <Link href="/auth/login">Sign In</Link>
          </Button>
          <Button
            asChild
            className="hidden bg-[#0A0A0A] text-white hover:bg-[#5d5e65] sm:inline-flex dark:bg-violet-600 dark:hover:bg-violet-500"
          >
            <Link href="/auth/signup">Get Started</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="border-[#e9e8e7] md:hidden dark:border-slate-700"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(100%,20rem)] dark:border-slate-800 dark:bg-slate-950"
            >
              <SheetHeader>
                <SheetTitle className="text-left">
                  <BrandMark />
                </SheetTitle>
              </SheetHeader>
              <div className="mt-8 flex flex-col gap-6">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-base font-medium text-[#1b1c1c] hover:text-[#2055FD] dark:text-slate-100 dark:hover:text-violet-400"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="flex flex-col gap-3 border-t border-[#e9e8e7] pt-6 dark:border-slate-800">
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/auth/login" onClick={() => setOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full bg-[#0A0A0A] text-white hover:bg-[#5d5e65] dark:bg-violet-600"
                  >
                    <Link href="/auth/signup" onClick={() => setOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Button
            asChild
            size="sm"
            className="bg-[#0A0A0A] text-white hover:bg-[#5d5e65] sm:hidden dark:bg-violet-600"
          >
            <Link href="/auth/signup">Start</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
