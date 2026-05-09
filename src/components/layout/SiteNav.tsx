"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/interactive/ThemeToggle";

interface SiteNavProps {
  locale: string;
  dict: Record<string, unknown>;
  siteName: string;
}

export function SiteNav({ locale, dict, siteName }: SiteNavProps) {
  const d = dict as {
    nav: { search: string; methodology: string; archive: string };
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
        <Link
          href={`/${locale}/`}
          className="font-heading text-lg font-bold tracking-tight text-foreground"
        >
          {siteName}
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <Link
            href={`/${locale}/search`}
            className="hidden sm:inline text-muted-foreground hover:text-primary transition-colors"
          >
            {d.nav.search}
          </Link>
          <Link
            href={`/${locale}/methodology`}
            className="hidden sm:inline text-muted-foreground hover:text-primary transition-colors"
          >
            {d.nav.methodology}
          </Link>
          <Link
            href={`/${locale}/archive`}
            className="hidden sm:inline text-muted-foreground hover:text-primary transition-colors"
          >
            {d.nav.archive}
          </Link>
          <div className="flex items-center gap-1 border-l border-border pl-2 ml-1">
            <ThemeToggle />
            <Link
              href={locale === "zh" ? `/en/` : `/zh/`}
              className="rounded-md border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground hover:text-accent-foreground hover:border-accent-foreground/30 hover:bg-accent/50 transition-colors"
            >
              {locale === "zh" ? "EN" : "中"}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
