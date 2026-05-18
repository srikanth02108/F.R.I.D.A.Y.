"use client";

import Link from "next/link";
import { Crown } from "lucide-react";

import { useUserPlan } from "@/components/providers/user-plan-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getMemberBadgeLabel } from "@/lib/plan-access";
import { cn } from "@/lib/utils";

const memberBadgeClass =
  "inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 px-4 py-1.5 text-sm font-bold text-white shadow-lg shadow-amber-500/25";

const upgradeButtonClass =
  "border-0 bg-gradient-to-r from-amber-500 to-orange-500 font-bold text-white shadow-lg transition-all duration-200 hover:brightness-110";

export function PlanActionButton({ className }: { className?: string }) {
  const { snapshot, loading } = useUserPlan();

  if (loading) {
    return <Skeleton className={cn("h-9 w-36 rounded-md", className)} />;
  }

  const badgeLabel = getMemberBadgeLabel(snapshot.plan);

  if (badgeLabel) {
    return (
      <span className={cn(memberBadgeClass, className)} role="status">
        <Crown className="size-4 shrink-0" aria-hidden />
        {badgeLabel}
      </span>
    );
  }

  return (
    <Button size="sm" asChild className={cn(upgradeButtonClass, className)}>
      <Link href="/pricing/pro">Upgrade to Pro</Link>
    </Button>
  );
}
