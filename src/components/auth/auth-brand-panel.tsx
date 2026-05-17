import Image from "next/image";
import { User } from "lucide-react";

import { BRAND_ACRONYM } from "@/lib/brand";

const SIGN_IN_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDslt6e6UKtsNpnB6iQETya2ZccdJmP-6-JFhRQV7Z8UslURuzRZvM46L11N5ie5eOOWOrmn9m1CEVGGxSQVDK0PDAuU63boqGBRnJNMpwgFci2bKro1pqAGvNDRhI8Vy53YpTqcXU6Lk98knITg1i6nkmZoZOFMFwF20myDoCvi3uH-jnIQ_F7_yCUEZLy1QuMhESeJA21irq4MH08QYNAVR8WDRASPoTQlPVMycif524EfFseVJIoEpTfLnEiFnf-LzjsYggjXng";

type AuthBrandPanelProps = {
  variant: "signin" | "signup";
};

function SignupPremiumPanel() {
  return (
    <div className="relative hidden flex-col overflow-hidden bg-gradient-to-tr from-indigo-950 via-slate-900 to-purple-950 lg:flex lg:w-[45%]">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_32px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 animate-pulse bg-gradient-to-br from-violet-600/20 via-transparent to-indigo-500/25"
        style={{ animationDuration: "8s" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-violet-500/30 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-32 size-56 rounded-full bg-indigo-400/20 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 flex items-center gap-2 p-10 md:p-12">
        <div className="flex size-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-sm font-bold text-white backdrop-blur-sm">
          F
        </div>
        <span className="text-xl font-semibold tracking-tight text-white">
          {BRAND_ACRONYM}
        </span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center px-10 pb-12 md:px-12">
        <div className="mb-10 space-y-4">
          <div className="inline-flex rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 font-mono text-[11px] font-medium tracking-widest text-violet-200 uppercase">
            AI Career Engineering
          </div>
          <h2 className="max-w-md text-3xl font-extrabold leading-tight tracking-tight text-white md:text-4xl md:leading-[1.15]">
            Precision resumes.
            <br />
            <span className="bg-gradient-to-r from-violet-300 to-indigo-200 bg-clip-text text-transparent">
              Interview-ready outcomes.
            </span>
          </h2>
          <p className="max-w-sm text-base leading-relaxed text-slate-300/90">
            Join professionals using specialized LLM pipelines to construct
            ATS-proof LaTeX resumes with mathematical precision.
          </p>
        </div>

        <div className="relative mt-4 h-40 w-full max-w-sm">
          <div
            className="absolute top-0 left-4 size-28 rotate-12 rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_40px_rgba(139,92,246,0.25)] backdrop-blur-md"
            aria-hidden
          />
          <div
            className="absolute top-8 right-0 size-32 -rotate-6 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 shadow-[0_0_50px_rgba(99,102,241,0.3)] backdrop-blur-md"
            aria-hidden
          />
          <div
            className="absolute bottom-0 left-12 size-24 rotate-[-8deg] rounded-xl border border-purple-400/30 bg-purple-600/15"
            aria-hidden
          />
          <div className="absolute top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-300/40 bg-violet-500/20 shadow-[0_0_60px_rgba(167,139,250,0.5)]" />
        </div>

        <p className="mt-10 border-t border-white/15 pt-6 text-sm text-slate-400">
          Trusted by{" "}
          <span className="font-semibold text-white">10,000+</span> job seekers
          across India&apos;s competitive hiring market.
        </p>
      </div>
    </div>
  );
}

export function AuthBrandPanel({ variant }: AuthBrandPanelProps) {
  const isSignup = variant === "signup";

  if (isSignup) {
    return <SignupPremiumPanel />;
  }

  return (
    <div className="relative hidden flex-col overflow-hidden bg-[#0A0A0A] lg:flex lg:w-1/2">
      <Image
        src={SIGN_IN_IMAGE}
        alt=""
        fill
        priority
        className="object-cover grayscale-[20%]"
        sizes="50vw"
        unoptimized
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />

      <div className="relative z-10 mt-auto mb-12 max-w-xl p-8 md:p-10">
        <div className="mb-6 h-1 w-12 bg-[#2055FD]" />
        <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white md:text-5xl md:leading-[56px]">
          Precision Engineering
          <br />
          For Your Career.
        </h2>
        <p className="mt-4 mb-8 text-base leading-7 text-[#e9e8e7] md:text-lg md:leading-7">
          Leverage LaTeX formatting and AI-driven ATS optimization to build a
          resume that commands authority.
        </p>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-3">
            <div className="flex size-10 items-center justify-center overflow-hidden rounded-full border-2 border-[#0A0A0A] bg-[#e4e2e2]">
              <User className="size-4 text-[#6B6B6B]" />
            </div>
            <div className="flex size-10 items-center justify-center overflow-hidden rounded-full border-2 border-[#0A0A0A] bg-[#e4e2e2]">
              <User className="size-4 text-[#6B6B6B]" />
            </div>
            <div className="flex size-10 items-center justify-center rounded-full border-2 border-[#0A0A0A] bg-[#2055FD] text-[11px] font-semibold text-white">
              10k+
            </div>
          </div>
          <p className="ml-2 text-sm text-[#e9e8e7]">
            Trusted by Indian job seekers.
          </p>
        </div>
      </div>
    </div>
  );
}
