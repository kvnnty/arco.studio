"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { docsNavigation, searchDocPages } from "@/lib/marketing/docs";
import { cn } from "@/lib/utils";

export function DocsSidebar() {
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  const trimmedQuery = query.trim();
  const searchResults = useMemo(
    () => (trimmedQuery ? searchDocPages(trimmedQuery) : []),
    [trimmedQuery],
  );

  const filteredNav = useMemo(() => {
    if (trimmedQuery) return [];
    const q = trimmedQuery.toLowerCase();
    return docsNavigation
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.title.toLowerCase().includes(q)),
      }))
      .filter((group) => group.items.length > 0);
  }, [trimmedQuery]);

  return (
    <aside className="w-full shrink-0 lg:w-56 xl:w-60">
      <div className="sticky top-24 space-y-6">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-marketing-subtle" />
          <input
            type="search"
            placeholder="Search docs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 w-full rounded-lg border border-marketing-border bg-marketing-surface pr-3 pl-9 text-[13px] text-foreground placeholder:text-marketing-subtle outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20"
          />
        </div>

        {trimmedQuery ? (
          <div aria-label="Search results">
            {searchResults.length > 0 ? (
              <ul className="space-y-1">
                {searchResults.map((result) => {
                  const isActive = pathname === result.href;
                  return (
                    <li key={result.href}>
                      <Link
                        href={result.href}
                        className={cn(
                          "block rounded-md px-2.5 py-2 transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-marketing-hover",
                        )}
                      >
                        <span className="block text-[13px] font-medium text-foreground">
                          {result.title}
                        </span>
                        <span className="mt-0.5 block text-[12px] leading-relaxed text-marketing-muted">
                          {result.snippet}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-2.5 text-[13px] text-marketing-muted">
                No docs match &ldquo;{trimmedQuery}&rdquo;
              </p>
            )}
          </div>
        ) : (
          <nav className="space-y-6" aria-label="Documentation">
            {filteredNav.map((group) => (
              <div key={group.title}>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-marketing-subtle">
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
        )}
      </div>
    </aside>
  );
}
