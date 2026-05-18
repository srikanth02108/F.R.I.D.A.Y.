"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

type FridayVerifiedBadgeProps = {
  className?: string;
};

export function FridayVerifiedBadge({ className }: FridayVerifiedBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[#2055FD]/25 bg-gradient-to-r from-[#2055FD]/10 via-white to-[#0EB87A]/10 px-3.5 py-1.5 shadow-[0_4px_20px_rgba(32,85,253,0.12)]",
        className,
      )}
    >
      <motion.span
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="flex size-6 items-center justify-center rounded-full bg-[#2055FD]/15"
      >
        <ShieldCheck className="size-3.5 text-[#2055FD]" />
      </motion.span>
      <span className="bg-gradient-to-r from-[#2055FD] to-[#0EB87A] bg-clip-text text-xs font-bold tracking-wide text-transparent uppercase">
        F.R.I.D.A.Y. Verified Match
      </span>
    </motion.div>
  );
}
