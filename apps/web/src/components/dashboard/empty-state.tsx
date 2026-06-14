import Link from "next/link";
import { type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardHeader className="items-center text-center">
        <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-muted">
          <Icon className="size-5 text-muted-foreground" />
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription className="max-w-sm">{description}</CardDescription>
      </CardHeader>
      {action ? (
        <CardContent className="flex justify-center pb-6">
          <Button
            render={action.href ? <Link href={action.href} /> : undefined}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        </CardContent>
      ) : null}
    </Card>
  );
}
