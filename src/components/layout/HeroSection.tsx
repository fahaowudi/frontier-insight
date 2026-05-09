import type { Digest } from "@/lib/types";
import { t } from "@/lib/i18n";

interface HeroSectionProps {
  dict: Record<string, unknown>;
  siteName: string;
  latest: Digest | null;
}

export function HeroSection({ dict, siteName, latest }: HeroSectionProps) {
  const slogan = t(dict as never, "hero.slogan");
  const tagline = t(dict as never, "hero.tagline");
  const stats = latest
    ? t(dict as never, "hero.stats", {
        sourceCount: String(latest.totalSources),
        articleCount: String(latest.totalArticles),
        featuredCount: String(latest.articles.length),
      })
    : null;

  return (
    <section className="relative text-center space-y-3 py-8 sm:py-10">
      <div className="mx-auto w-12 h-0.5 rounded-full bg-gradient-to-r from-primary via-highlight to-primary" />
      <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
        {siteName}
      </h1>
      <p className="text-muted-foreground text-sm font-medium">{slogan}</p>
      <p className="text-xs text-muted-foreground/70 tracking-wider">
        {tagline}
      </p>
      {stats && (
        <p className="mt-4 inline-block rounded-full bg-primary/8 px-4 py-1.5 text-xs font-medium text-primary ring-1 ring-primary/15">
          {stats}
        </p>
      )}
    </section>
  );
}
