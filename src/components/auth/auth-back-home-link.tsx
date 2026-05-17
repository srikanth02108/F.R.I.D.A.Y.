import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function AuthBackHomeLink() {
  return (
    <Link
      href="/"
      className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#6B6B6B] transition-colors hover:text-[#2055FD] hover:underline dark:text-slate-400 dark:hover:text-violet-400"
    >
      <ArrowLeft className="size-4 shrink-0" />
      Back to Home
    </Link>
  );
}
