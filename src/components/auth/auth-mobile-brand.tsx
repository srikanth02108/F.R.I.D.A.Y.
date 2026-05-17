import Link from "next/link";

import { BRAND_ACRONYM } from "@/lib/brand";

export function AuthMobileBrand() {
  return (
    <Link
      href="/"
      className="mb-8 flex items-center gap-2 transition-opacity hover:opacity-80 lg:hidden"
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#0A0A0A] px-1 text-[10px] font-bold leading-none text-white dark:bg-white dark:text-[#0A0A0A]">
        F
      </span>
      <span className="text-xl font-semibold tracking-tight text-[#1b1c1c] dark:text-white">
        {BRAND_ACRONYM}
      </span>
    </Link>
  );
}

export function AuthDesktopBrandMark() {
  return (
    <Link
      href="/"
      className="mb-12 hidden text-2xl font-extrabold tracking-tight text-[#0A0A0A] transition-opacity hover:opacity-80 dark:text-white lg:inline-block"
    >
      {BRAND_ACRONYM}
    </Link>
  );
}
