type Testimonial = {
  quote: string;
  author: string;
  role: string;
};

type TestimonialGridProps = {
  testimonials: Testimonial[];
};

export function TestimonialGrid({ testimonials }: TestimonialGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {testimonials.map((t) => (
        <figure
          key={t.author}
          className="flex flex-col rounded-2xl border border-[var(--marketing-border)] bg-[var(--marketing-surface)] p-6"
        >
          <blockquote className="flex-1 text-[15px] leading-relaxed text-[var(--marketing-muted)]">
            &ldquo;{t.quote}&rdquo;
          </blockquote>
          <figcaption className="mt-6 border-t border-[var(--marketing-border)] pt-4">
            <p className="text-[14px] font-semibold text-foreground">{t.author}</p>
            <p className="text-[13px] text-[var(--marketing-subtle)]">{t.role}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
