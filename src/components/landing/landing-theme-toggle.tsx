"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  applyFridayTheme,
  persistFridayTheme,
  resolveIsDark,
} from "@/lib/theme";
import { cn } from "@/lib/utils";

export function LandingThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = resolveIsDark();
    setDark(isDark);
    applyFridayTheme(isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    applyFridayTheme(next);
    persistFridayTheme(next);
  };

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn("size-9 border-[#e9e8e7]", className)}
        aria-label="Toggle color theme"
        disabled
      />
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggle}
      className={cn(
        "size-9 border-[#e9e8e7] bg-white/80 text-[#1b1c1c] hover:border-[#2055FD] hover:bg-[#2055FD]/5 hover:text-[#2055FD] dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:border-violet-500 dark:hover:bg-violet-500/10 dark:hover:text-violet-300",
        className,
      )}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={dark}
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
