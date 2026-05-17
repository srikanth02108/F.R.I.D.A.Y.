"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { AuthGoogleButton } from "@/components/auth/auth-google-button";
import {
  authInputClassName,
  authLabelClassName,
  authPrimaryButtonClassName,
} from "@/components/auth/auth-form-styles";
import { AuthMobileBrand } from "@/components/auth/auth-mobile-brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/app/profile`;

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: redirectTo,
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    if (data.session) {
      toast.success("Account created! Let's set up your profile.");
      router.push("/app/profile");
      router.refresh();
      return;
    }

    toast.success("Check your email to confirm your account.");
  }

  return (
    <div className="flex min-h-screen w-full">
      <AuthBrandPanel variant="signup" />

      <div className="flex w-full items-center justify-center overflow-y-auto bg-[#fbf9f8] p-4 sm:p-12 lg:w-[55%]">
        <div className="w-full max-w-[440px] space-y-8 py-6">
          <AuthMobileBrand />

          <div className="space-y-2">
            <h1 className="text-[32px] font-bold leading-10 tracking-tight text-[#1b1c1c]">
              Create Account
            </h1>
            <p className="text-base text-[#46464b]">
              Join 10k+ professionals tailoring their path to success.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="fullName" className={authLabelClassName}>
                Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                placeholder="Rahul Sharma"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                className={authInputClassName}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className={authLabelClassName}>
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="rahul@example.com"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className={authInputClassName}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className={authLabelClassName}>
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                minLength={6}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className={authInputClassName}
              />
            </div>

            <Button
              type="submit"
              className={cn(authPrimaryButtonClassName, "mt-2 gap-2 shadow-[0_4px_20px_rgba(10,10,10,0.15)]")}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="size-[18px]" />
                </>
              )}
            </Button>
          </form>

          <div className="relative flex items-center py-2">
            <div className="grow border-t border-[#e9e8e7]" />
            <span className="mx-4 shrink-0 font-mono text-[13px] font-medium tracking-[0.05em] text-[#46464b]">
              OR
            </span>
            <div className="grow border-t border-[#e9e8e7]" />
          </div>

          <AuthGoogleButton disabled />

          <p className="pt-4 text-center text-sm text-[#46464b]">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-[15px] font-semibold text-[#2055FD] transition-colors hover:text-[#003fd8] hover:underline"
            >
              Sign In
            </Link>
          </p>

          <p className="text-center text-xs leading-relaxed text-[#82838b]">
            By creating an account, you agree to our{" "}
            <Link href="/" className="underline hover:text-[#1b1c1c]">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/" className="underline hover:text-[#1b1c1c]">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
