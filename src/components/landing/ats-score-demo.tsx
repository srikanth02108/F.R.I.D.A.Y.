"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

function ScoreCard({
  label,
  score,
  variant,
  active,
}: {
  label: string;
  score: number;
  variant: "before" | "after";
  active: boolean;
}) {
  const isAfter = variant === "after";

  return (
    <div
      className={cn(
        "flex h-48 w-full flex-col justify-center rounded-2xl border-2 p-8 transition-all duration-700 md:w-2/5",
        isAfter
          ? active
            ? "scale-100 border-[#38A169] bg-[#F0FFF4] shadow-lg md:hover:scale-105"
            : "border-[#e9e8e7] bg-white shadow-sm"
          : active
            ? "border-[#DD6B20] bg-white shadow-sm"
            : "border-[#e9e8e7] bg-white shadow-sm",
      )}
    >
      <span
        className={cn(
          "mb-4 font-mono text-sm font-bold tracking-widest uppercase",
          isAfter ? "text-[#276749]" : "text-[#C05621]",
        )}
      >
        {label}
      </span>
      <p
        className={cn(
          "mb-4 text-6xl font-extrabold tabular-nums tracking-tight",
          isAfter ? "text-[#38A169]" : "text-[#DD6B20]",
        )}
      >
        {score}
      </p>
      <p className="text-sm text-[#6B6B6B]">
        {isAfter
          ? "ATS-optimized keywords, metrics, and structure"
          : "Generic phrasing · missing role keywords"}
      </p>
    </div>
  );
}

export function AtsScoreDemo() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [displayScore, setDisplayScore] = useState(58);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    const start = 58;
    const end = 91;
    const duration = 1400;
    const startTime = performance.now();

    let frameId = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      const value = Math.round(start + (end - start) * eased);
      setDisplayScore(value);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [hasAnimated]);

  return (
    <section
      ref={sectionRef}
      id="ats-score"
      className="scroll-mt-28 border-b border-[#e9e8e7] bg-[#fbf9f8] py-16 md:py-24 dark:border-slate-800 dark:bg-slate-950"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 text-center md:mb-14">
          <h2 className="text-3xl font-bold tracking-tight text-[#0A0A0A] md:text-4xl dark:text-white">
            Watch your ATS score climb
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-[#6B6B6B] md:text-lg dark:text-slate-400">
            Friday Tailoring once — see measurable lift in keyword match and
            parser-friendly structure before you hit apply.
          </p>
        </div>

        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-8 md:flex-row md:gap-12">
          <ScoreCard
            label="Before Tailoring"
            score={58}
            variant="before"
            active={!hasAnimated || displayScore < 75}
          />

          <div className="flex shrink-0 flex-col items-center justify-center gap-3">
            <ArrowRight className="size-10 font-bold text-[#805AD5] md:size-8" />
            <span className="rounded-full border border-[#E9D8FD] bg-[#FAF5FF] px-4 py-1.5 font-mono text-xs font-bold tracking-wide text-[#6B46C1] dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300">
              Friday Tailoring
            </span>
          </div>

          <ScoreCard
            label="After Tailoring"
            score={hasAnimated ? displayScore : 58}
            variant="after"
            active={hasAnimated && displayScore >= 75}
          />
        </div>
      </div>
    </section>
  );
}
