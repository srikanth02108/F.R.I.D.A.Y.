export const THEME_STORAGE_KEY = "friday-theme";

export function readStoredThemePreference(): "light" | "dark" | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return null;
}

export function resolveIsDark(): boolean {
  if (typeof window === "undefined") return false;
  const stored = readStoredThemePreference();
  if (stored === "dark") return true;
  if (stored === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyFridayTheme(isDark: boolean): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", isDark);
}

export function persistFridayTheme(isDark: boolean): void {
  localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
}
