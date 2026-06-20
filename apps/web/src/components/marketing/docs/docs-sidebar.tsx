"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { docsNavigation } from "@/lib/marketing/docs";
import { cn } from "@/lib/utils";

export function DocsSidebar() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  const filteredNav = useMemo(() => {
    if (!query.trim()) return docsNavigation;
    const q = query.toLowerCase();
    return docsNavigation
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.title.toLowerCase().includes(q)),
      }))
      .filter((group) => group.items.length > 0);
  }, [query]);

  return (
    <aside className="w-full shrink-0 lg:w-56 xl:w-60">
      <div className="sticky top-24 space-y-6">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[var(--marketing-subtle)]" />
          <input
            type="search"
            placeholder="Search docs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 w-full rounded-lg border border-[var(--marketing-border)] bg-[var(--marketing-surface)] pr-3 pl-9 text-[13px] text-foreground placeholder:text-[var(--marketing-subtle)] outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
          />
        </div>

        <nav className="space-y-6" aria-label="Documentation">
          {filteredNav.map((group) => (
            <div key={group.title}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--marketing-subtle)]">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "block rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
                          isActive
                            ? "bg-primary/10 font-medium text-primary"
                            : "text-marketing-muted hover:bg-marketing-hover hover:text-foreground",
                        )}
                      >
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
