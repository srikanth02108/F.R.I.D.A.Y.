"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { AuthBackHomeLink } from "@/components/auth/auth-back-home-link";
import {
  authInputClassName,
  authLabelClassName,
  authPrimaryButtonClassName,
} from "@/components/auth/auth-form-styles";
import { AuthMobileBrand } from "@/components/auth/auth-mobile-brand";
import { LandingThemeToggle } from "@/components/landing/landing-theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BRAND_ACRONYM } from "@/lib/brand";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error(
          "Reset link expired or invalid. Request a new password reset email.",
        );
      }
      setSessionReady(true);
    });
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Password updated successfully!");
    router.push("/app/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fbf9f8] p-4 dark:bg-zinc-950">
      <div className="absolute top-4 right-4 z-10">
        <LandingThemeToggle />
      </div>

      <div className="w-full max-w-md rounded-xl border border-[#e9e8e7] bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
        <AuthBackHomeLink />
        <AuthMobileBrand />

        <h1 className="mb-2 text-2xl font-bold text-[#1b1c1c] dark:text-zinc-50">
          Set a new password
        </h1>
        <p className="mb-6 text-sm text-[#6B6B6B] dark:text-zinc-400">
          Choose a secure password for your {BRAND_ACRONYM} account.
        </p>

        {!sessionReady ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-8 animate-spin text-[#2055FD]" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="password" className={authLabelClassName}>
                New password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className={authInputClassName}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="confirmPassword" className={authLabelClassName}>
                Confirm password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className={authInputClassName}
              />
            </div>

            <Button
              type="submit"
              className={cn(authPrimaryButtonClassName, "mt-2")}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Updating…
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-[#6B6B6B] dark:text-zinc-400">
          <Link
            href="/auth/login"
            className="font-semibold text-[#2055FD] hover:underline dark:text-violet-400"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
