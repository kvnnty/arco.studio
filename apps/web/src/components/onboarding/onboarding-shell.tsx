import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type OnboardingShellProps = {
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const widthClass = {
  sm: "max-w-lg",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
} as const;

export function OnboardingShell({
  children,
  footer,
  width = "md",
  className,
}: OnboardingShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center px-6 py-5 sm:px-10">
        <Link href="/" className="w-fit">
          <Image
            src="/arcologo-black.svg"
            alt="Arco"
            width={410}
            height={85}
            className="h-7 w-24"
          />
        </Link>
      </header>

      <main
        className={cn(
          "mx-auto flex w-full flex-1 flex-col px-6 pb-32 pt-4 sm:px-10",
          widthClass[width],
          className,
        )}
      >
        {children}
      </main>

      {footer ? (
        <footer className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 px-6 py-4 backdrop-blur sm:px-10">
          <div className={cn("mx-auto flex items-center justify-end gap-3", widthClass[width])}>
            {footer}
          </div>
        </footer>
      ) : null}
    </div>
  );
}
