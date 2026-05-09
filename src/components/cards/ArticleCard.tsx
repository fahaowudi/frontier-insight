import Link from "next/link";
import type { Digest } from "@/lib/types";
import { t } from "@/lib/i18n";

interface ArticleCardProps {
  digest: Digest;
  locale: string;
  dict: Record<string, unknown>;
}

export function ArticleCard({ digest, locale, dict }: ArticleCardProps) {
  return (
    <Link href={`/${locale}/digest/${digest.slug}`}>
      <article className="group rounded-xl border border-border/80 bg-card p-4 hover:shadow-sm hover:border-primary/20 transition-all">
        <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
          <time className="font-mono">{digest.date}</time>
          <span className="text-[10px] text-muted-foreground/60">
            {t(dict as never, "digest.insightCount", {
              count: String(digest.articles.length),
            })}
          </span>
        </div>
        <h3 className="font-heading font-medium text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {digest.title}
        </h3>
        {digest.articles[0]?.tags && (
          <div className="mt-2 flex flex-wrap gap-1">
            {[...new Set(digest.articles.flatMap((a) => a.tags))]
              .slice(0, 3)
              .map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-accent/50 px-1.5 py-0.5 text-[10px] text-accent-foreground"
                >
                  {tag}
                </span>
              ))}
          </div>
        )}
      </article>
    </Link>
  );
}
