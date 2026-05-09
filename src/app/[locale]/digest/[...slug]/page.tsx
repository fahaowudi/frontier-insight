import type { Metadata } from "next";
import { loadDictionary } from "@/lib/i18n";
import { loadDomainConfig } from "@/lib/config";
import { getDigestBySlug, getAllDigests } from "@/lib/content";
import { generateArticleJsonLd, getBaseUrl } from "@/lib/seo";
import { notFound } from "next/navigation";
import Link from "next/link";

export async function generateStaticParams() {
  const locales = ["zh", "en"];
  const params: { locale: string; slug: string[] }[] = [];
  for (const locale of locales) {
    const digests = getAllDigests(locale);
    for (const d of digests) {
      params.push({ locale, slug: [d.slug] });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const digest = getDigestBySlug(locale, slug[0]);
  if (!digest) return {};

  const config = loadDomainConfig("science");
  const baseUrl = getBaseUrl(config.site);
  const description = digest.articles[0]?.summary?.slice(0, 160) || "";

  return {
    title: `${digest.title} | ${config.site.name}`,
    description,
    openGraph: {
      title: digest.title,
      description,
      type: "article",
      publishedTime: digest.date,
      locale: locale === "zh" ? "zh_CN" : "en_US",
      url: `${baseUrl}/${locale}/digest/${digest.slug}/`,
    },
    twitter: {
      card: "summary",
      title: digest.title,
      description,
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/digest/${digest.slug}/`,
    },
  };
}

export default async function DigestDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { locale, slug } = await params;
  const dict = loadDictionary(locale);
  const config = loadDomainConfig("science");
  const digest = getDigestBySlug(locale, slug[0]);

  if (!digest) notFound();

  const filteredLabel = dict.digest.filteredFrom.replace(
    "{count}",
    String(digest.totalSources),
  );

  const jsonLd = generateArticleJsonLd(digest, config.site);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div
        className="mx-auto max-w-3xl px-4 sm:px-6 py-8"
        data-pagefind-body
        data-pagefind-meta={`title:${digest.title},date:${digest.date},locale:${digest.locale}`}
      >
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
            <Link
              href={`/${locale}/`}
              className="hover:text-primary transition-colors"
            >
              {(dict as Record<string, Record<string, string>>).nav.home}
            </Link>
            <span>/</span>
            <time className="font-mono">{digest.date}</time>
          </div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold leading-snug">
            {digest.title}
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">{filteredLabel}</p>
        </header>

        <section className="space-y-8 mb-10">
          <h2 className="text-xs font-semibold text-primary/70 tracking-wider uppercase">
            {dict.digest.deepInsight}
          </h2>
          {digest.articles.map((article) => (
            <article
              key={article.number}
              className="border-l-2 border-highlight/30 pl-4 sm:pl-6"
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="font-heading text-3xl font-bold text-highlight shrink-0">
                  {String(article.number).padStart(2, "0")}
                </span>
                <h3 className="font-heading text-lg font-semibold leading-snug pt-1">
                  {article.headline}
                </h3>
              </div>
              <div className="text-sm leading-relaxed text-foreground/80 space-y-3">
                {article.summary
                  .split("\n")
                  .filter(Boolean)
                  .map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-accent/60 px-2 py-0.5 text-[10px] text-accent-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="mb-10">
          <h2 className="text-xs font-semibold text-primary/70 tracking-wider uppercase mb-4">
            {dict.digest.quickNews}
          </h2>
          <ul className="space-y-2.5">
            {digest.quickNews.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-highlight/60 font-mono shrink-0 text-xs pt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="leading-relaxed">{item.text}</span>
                <a
                  href={item.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-primary shrink-0 hover:underline pt-0.5"
                >
                  {item.source.domain}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-border pt-6 mb-8">
          <h2 className="text-xs font-semibold text-primary/70 tracking-wider uppercase mb-4">
            {dict.digest.sources}
          </h2>
          <div className="flex flex-wrap gap-2">
            {digest.articles
              .flatMap((a) => a.sources)
              .map((s, i) => (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                  {s.domain}
                </a>
              ))}
          </div>
        </section>
      </div>
    </>
  );
}
