import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type MarketingLogoProps = {
  className?: string;
  priority?: boolean;
  linked?: boolean;
};

export function MarketingLogo({
  className,
  priority = false,
  linked = true,
}: MarketingLogoProps) {
  const logo = (
    <>
      <Image
        src="/arcologo-black.svg"
        alt="Arco"
        width={410}
        height={85}
        className={cn("dark:hidden", className)}
        priority={priority}
      />
      <Image
        src="/arcologo-white.svg"
        alt="Arco"
        width={410}
        height={85}
        className={cn("hidden dark:block", className)}
        priority={priority}
      />
    </>
  );

  if (!linked) {
    return logo;
  }

  return (
    <Link
      href="/"
      className="inline-flex transition-opacity hover:opacity-80"
      aria-label="Arco home"
    >
      {logo}
    </Link>
  );
}
