"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { AuthBackHomeLink } from "@/components/auth/auth-back-home-link";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { AuthGoogleButton } from "@/components/auth/auth-google-button";
import {
  authInputClassName,
  authLabelClassName,
  authPrimaryButtonClassName,
} from "@/components/auth/auth-form-styles";
import {
  AuthDesktopBrandMark,
  AuthMobileBrand,
} from "@/components/auth/auth-mobile-brand";
import { LandingThemeToggle } from "@/components/landing/landing-theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Welcome back!");
    router.push("/app/dashboard");
    router.refresh();
  }

  async function handleForgotPassword() {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      toast.error("Please enter your email address first, then try again.");
      return;
    }

    setResettingPassword(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) {
        throw error;
      }

      toast.success(
        "Password reset email sent! Check your inbox for the secure reset link.",
        { duration: 6000 },
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not send password reset email";
      toast.error(message);
    } finally {
      setResettingPassword(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      <AuthBrandPanel variant="signin" />

      <div className="relative flex w-full items-center justify-center overflow-y-auto bg-[#fbf9f8] p-4 sm:p-6 md:p-10 lg:w-1/2 dark:bg-zinc-950">
        <div className="absolute top-4 right-4 z-10 sm:top-6 sm:right-6">
          <LandingThemeToggle />
        </div>

        <div className="flex w-full max-w-md flex-col py-6">
          <AuthBackHomeLink />
          <AuthMobileBrand />
          <AuthDesktopBrandMark />

          <div className="mb-8">
            <h1 className="mb-2 text-[28px] font-bold leading-9 tracking-tight text-[#1b1c1c] md:text-[32px] md:leading-10 dark:text-zinc-50">
              Sign In
            </h1>
            <p className="text-base text-[#6B6B6B] dark:text-zinc-400">
              Enter your details to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className={authLabelClassName}>
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className={authInputClassName}
              />
            </div>

            <div className="space-y-1 pt-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="password" className={authLabelClassName}>
                  Password
                </label>
                <button
                  type="button"
                  className="cursor-pointer text-sm font-medium text-purple-500 transition-colors hover:text-purple-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60 dark:text-violet-400 dark:hover:text-violet-300"
                  onClick={() => void handleForgotPassword()}
                  disabled={loading || resettingPassword}
                >
                  {resettingPassword ? "Sending…" : "Forgot password?"}
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className={cn(authInputClassName, "pr-11")}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#77777c] transition-colors hover:text-[#1b1c1c] dark:text-zinc-500 dark:hover:text-zinc-200"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <Eye className="size-5" />
                  ) : (
                    <EyeOff className="size-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-6">
              <Button
                type="submit"
                className={authPrimaryButtonClassName}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </div>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <div className="w-full border-t border-[#e9e8e7] dark:border-zinc-800" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#fbf9f8] px-4 font-mono text-[13px] font-medium tracking-[0.05em] text-[#6B6B6B] dark:bg-zinc-950 dark:text-zinc-500">
                OR
              </span>
            </div>
          </div>

          <AuthGoogleButton />

          <p className="mt-10 text-center text-base text-[#6B6B6B] dark:text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="ml-1 text-[15px] font-semibold text-[#2055FD] transition-colors hover:text-[#2558ff] dark:text-violet-400"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
