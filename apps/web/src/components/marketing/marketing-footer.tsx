import Link from "next/link";

import { CookieSettingsTrigger } from "@/components/consent/cookie-settings-trigger";
import { MarketingLogo } from "@/components/marketing/marketing-logo";
import { footerColumns, siteConfig } from "@/lib/marketing/site-config";

export function MarketingFooter() {
  return (
    <footer className="border-t border-[var(--marketing-border)] bg-[var(--marketing-bg)]">
      <div className="marketing-container py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link href="/" aria-label="Arco home">
              <MarketingLogo className="h-7 w-24" linked={false} />
            </Link>
            <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-marketing-muted">
              {siteConfig.tagline}
            </p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-[13px] font-semibold tracking-wide text-foreground">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith("mailto:") ? (
                      <a
                        href={link.href}
                        className="text-[13px] text-[var(--marketing-muted)] transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-[13px] text-[var(--marketing-muted)] transition-colors hover:text-foreground"
                        {...(link.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-[var(--marketing-border)] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-[var(--marketing-subtle)]">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <div className="flex gap-6 text-[12px] text-[var(--marketing-muted)]">
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-foreground">
              Terms
            </Link>
            <CookieSettingsTrigger className="text-[12px] text-[var(--marketing-muted)]" />
            <a
              href="mailto:hello@arco.app"
              className="transition-colors hover:text-foreground"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
