"use client";

import { useEffect } from "react";

import { applyFridayTheme, resolveIsDark } from "@/lib/theme";

export function FridayThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    applyFridayTheme(resolveIsDark());
  }, []);

  return children;
}
