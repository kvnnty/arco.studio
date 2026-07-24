"use client";

import { CheckCircle2, Loader2, Mail, XCircle } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AuthStatusVariant = "loading" | "success" | "error" | "info";

export function AuthStatusCard({
  variant,
  title,
  description,
  restartHref,
  restartLabel = "Back to sign in",
  footer,
}: {
  variant: AuthStatusVariant;
  title: string;
  description: string;
  restartHref?: string;
  restartLabel?: string;
  footer?: ReactNode;
}) {
  const Icon =
    variant === "loading"
      ? Loader2
      : variant === "success"
        ? CheckCircle2
        : variant === "error"
          ? XCircle
          : Mail;

  return (
    <Card className="w-full max-w-md rounded-2xl border-none shadow-none ring-0">
      <CardHeader className="items-center space-y-4 pb-2 text-center">
        <div
          className={cn(
            "flex size-14 items-center justify-center rounded-full",
            variant === "loading" && "bg-muted text-muted-foreground",
            variant === "success" && "bg-emerald-500/10 text-emerald-600",
            variant === "error" && "bg-destructive/10 text-destructive",
            variant === "info" && "bg-primary/10 text-primary",
          )}
        >
          <Icon
            className={cn("size-7", variant === "loading" && "animate-spin")}
            aria-hidden
          />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="text-balance text-sm leading-relaxed">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      {footer ? <CardContent className="pt-2">{footer}</CardContent> : null}
      {!footer && restartHref ? (
        <CardContent className="pt-2">
          <Button className="w-full" render={<Link href={restartHref} />}>
            {restartLabel}
          </Button>
        </CardContent>
      ) : null}
    </Card>
  );
}
