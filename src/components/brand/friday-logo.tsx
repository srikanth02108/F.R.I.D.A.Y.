import Image from "next/image";
import Link from "next/link";

import { BRAND_ACRONYM } from "@/lib/brand";
import { cn } from "@/lib/utils";

export const FRIDAY_LOGO_SRC = "/friday-logo.png";

type FridayLogoProps = {
  size?: number;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  className?: string;
  href?: string;
};

export function FridayLogo({
  size = 36,
  showWordmark = true,
  wordmarkClassName,
  className,
  href,
}: FridayLogoProps) {
  const content = (
    <>
      <Image
        src={FRIDAY_LOGO_SRC}
        alt={`${BRAND_ACRONYM} logo`}
        width={size}
        height={size}
        className={cn("shrink-0 rounded-full object-cover", className)}
        priority
      />
      {showWordmark ? (
        <span
          className={cn(
            "font-semibold leading-tight tracking-tight",
            wordmarkClassName,
          )}
        >
          {BRAND_ACRONYM}
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
      >
        {content}
      </Link>
    );
  }

  return <div className="flex items-center gap-2.5">{content}</div>;
}
