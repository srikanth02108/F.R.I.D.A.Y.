import Link from "next/link";

export function AuthMobileBrand() {
  return (
    <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
      <span className="flex size-8 items-center justify-center rounded-lg bg-[#0A0A0A] text-sm font-bold text-white">
        T
      </span>
      <span className="text-xl font-semibold tracking-tight text-[#1b1c1c]">
        TYR
      </span>
    </Link>
  );
}

export function AuthDesktopBrandMark() {
  return (
    <Link
      href="/"
      className="mb-12 hidden text-2xl font-extrabold tracking-tight text-[#0A0A0A] lg:inline-block"
    >
      TYR
    </Link>
  );
}
