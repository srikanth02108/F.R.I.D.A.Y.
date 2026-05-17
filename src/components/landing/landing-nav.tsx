"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
] as const;

function BrandMark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "text-xl font-extrabold tracking-tight text-[#0A0A0A]",
        className,
      )}
    >
      TYR
    </Link>
  );
}

export function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 border-b border-[#e9e8e7] bg-white/80 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 md:px-10 lg:h-20">
        <div className="flex items-center gap-6 md:gap-8">
          <BrandMark />

          <div className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-base text-[#46464b] transition-colors hover:text-[#2055FD]"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            variant="ghost"
            asChild
            className="hidden text-[#2055FD] hover:bg-[#2055FD]/10 hover:text-[#2055FD] sm:inline-flex"
          >
            <Link href="/auth/login">Sign In</Link>
          </Button>
          <Button
            asChild
            className="hidden bg-[#0A0A0A] text-white hover:bg-[#5d5e65] sm:inline-flex"
          >
            <Link href="/auth/signup">Get Started</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="border-[#e9e8e7] md:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100%,20rem)]">
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
                    className="text-base font-medium text-[#1b1c1c] hover:text-[#2055FD]"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="flex flex-col gap-3 border-t border-[#e9e8e7] pt-6">
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/auth/login" onClick={() => setOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full bg-[#0A0A0A] text-white hover:bg-[#5d5e65]"
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
            className="bg-[#0A0A0A] text-white hover:bg-[#5d5e65] sm:hidden"
          >
            <Link href="/auth/signup">Start</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
