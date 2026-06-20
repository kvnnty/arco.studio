type LogoCloudProps = {
  logos: string[];
  label?: string;
};

export function LogoCloud({
  logos,
  label = "Trusted by product teams at",
}: LogoCloudProps) {
  return (
    <section className="border-y border-[var(--marketing-border)] py-12">
      <div className="marketing-container">
        <p className="mb-8 text-center text-[12px] font-medium uppercase tracking-[0.12em] text-[var(--marketing-subtle)]">
          {label}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {logos.map((logo) => (
            <span
              key={logo}
              className="text-[15px] font-semibold tracking-tight text-[var(--marketing-subtle)] transition-colors hover:text-[var(--marketing-muted)]"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
