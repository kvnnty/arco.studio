import Image from "next/image";
import Link from "next/link";

import { MarketingBoundaryLines } from "@/components/marketing/marketing-boundary-lines";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ErrorAction = {
  label: string;
  href?: string;
  onClick?: () => void;
};

type ErrorPageProps = {
  code: string;
  title: string;
  description: string;
  primaryAction: ErrorAction;
  secondaryAction?: ErrorAction;
  variant?: "full" | "inset";
  className?: string;
};

function ErrorActionButton({
  action,
  variant = "default",
}: {
  action: ErrorAction;
  variant?: "default" | "outline";
}) {
  if (action.href) {
    return (
      <Button
        variant={variant}
        size={variant === "outline" ? "lg" : "lg"}
        className={variant === "outline" ? "border-marketing-border" : undefined}
        render={<Link href={action.href} />}
      >
        {action.label}
      </Button>
    );
  }

  return (
    <Button variant={variant} size="lg" onClick={action.onClick}>
      {action.label}
    </Button>
  );
}

export function ErrorPage({
  code,
  title,
  description,
  primaryAction,
  secondaryAction,
  variant = "full",
  className,
}: ErrorPageProps) {
  if (variant === "inset") {
    return (
      <div
        className={cn(
          "mx-auto flex w-full max-w-lg flex-col items-center py-16 text-center",
          className,
        )}
      >
        <p className="text-[4rem] font-semibold leading-none tracking-tighter text-primary/80">
          {code}
        </p>
        <h1 className="mt-6 text-xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-muted-foreground">
          {description}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <ErrorActionButton action={primaryAction} />
          {secondaryAction ? (
            <ErrorActionButton action={secondaryAction} variant="outline" />
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "marketing-site relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-20",
        className,
      )}
    >
      <MarketingBoundaryLines />
      <div className="marketing-glow pointer-events-none absolute inset-0" />
      <div className="marketing-grid-bg pointer-events-none absolute inset-0 opacity-40" />

      <div className="relative w-full max-w-lg text-center">
        <Link
          href="/"
          className="mx-auto mb-12 inline-flex transition-opacity hover:opacity-80"
          aria-label="Arco home"
        >
          <Image
            src="/arcologo-black.svg"
            alt="Arco"
            width={410}
            height={85}
            className="h-7 w-24"
          />
        </Link>

        <p
          className="text-[5rem] font-semibold leading-none tracking-tighter text-primary sm:text-[6rem]"
          aria-hidden
        >
          {code}
        </p>

        <h1 className="marketing-heading mt-6 text-[2.1rem] sm:text-[2.4rem]">{title}</h1>
        <p className="mt-3 text-pretty text-[16px] leading-relaxed text-marketing-muted">
          {description}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <ErrorActionButton action={primaryAction} />
          {secondaryAction ? (
            <ErrorActionButton action={secondaryAction} variant="outline" />
          ) : null}
        </div>
      </div>
    </div>
  );
}
