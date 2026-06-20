import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="marketing-heading text-[2rem] leading-tight sm:text-[2.5rem]">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-pretty text-[16px] leading-relaxed text-[var(--marketing-muted)]">
          {description}
        </p>
      ) : null}
    </div>
  );
}
