import Link from "next/link";
import type { Digest } from "@/lib/types";
import { t } from "@/lib/i18n";

interface FeaturedCardProps {
  digest: Digest;
  locale: string;
  dict: Record<string, unknown>;
}

export function FeaturedCard({ digest, locale, dict }: FeaturedCardProps) {
  const filteredLabel = t(dict as never, "digest.filteredFrom", {
    count: String(digest.totalSources),
  });

  return (
    <Link href={`/${locale}/digest/${digest.slug}`}>
      <article className="group rounded-xl bg-card border border-border/80 shadow-sm hover:shadow-md hover:border-primary/20 transition-all overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary via-highlight to-primary/60" />
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
            <time className="font-mono">{digest.date}</time>
            <span className="inline-block rounded-full bg-primary/8 px-2 py-0.5 text-[10px] font-medium text-primary ring-1 ring-primary/10">
              {filteredLabel}
            </span>
          </div>

          <div className="space-y-4">
            {digest.articles.map((article) => (
              <div key={article.number} className="flex gap-3">
                <span className="font-heading text-2xl font-bold text-highlight/60 shrink-0 w-8">
                  {String(article.number).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-heading font-semibold text-sm leading-snug group-hover:text-primary transition-colors">
                    {article.headline}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {article.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {digest.articles[0]?.tags && (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {[...new Set(digest.articles.flatMap((a) => a.tags))]
                .slice(0, 5)
                .map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-accent/60 px-2 py-0.5 text-[10px] text-accent-foreground"
                  >
                    {tag}
                  </span>
                ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
