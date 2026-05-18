import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { LandingNav } from "@/components/landing/landing-nav";
import { Button } from "@/components/ui/button";
import { BRAND_ACRONYM } from "@/lib/brand";

export default function PricingHubPage() {
  return (
    <div className="min-h-screen bg-[#fbf9f8] dark:bg-zinc-950">
      <LandingNav />
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-28 text-center sm:px-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 md:text-4xl dark:text-zinc-50">
          {BRAND_ACRONYM} Plans
        </h1>
        <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
          Choose the tier that matches your hiring velocity.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/pricing/pro">
              Pro — ₹299/mo
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="gap-2">
            <Link href="/pricing/team">
              Team — ₹999/mo
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <p className="mt-8">
          <Link
            href="/#pricing"
            className="text-sm font-medium text-[#2055FD] hover:underline dark:text-violet-400"
          >
            Compare all plans on the homepage
          </Link>
        </p>
      </main>
    </div>
  );
}
