import type { Metadata } from "next";
import { loadDictionary } from "@/lib/i18n";
import { loadDomainConfig } from "@/lib/config";
import { getAllDigests } from "@/lib/content";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = loadDictionary(locale);
  const config = loadDomainConfig("science");
  return {
    title: `${dict.archive.title} | ${config.site.name}`,
    description:
      locale === "zh"
        ? `浏览 ${config.site.name} 的所有历史简报存档`
        : `Browse all historical digest archives of ${config.site.name}`,
  };
}

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = loadDictionary(locale);
  const digests = getAllDigests(locale);

  const grouped = digests.reduce<Record<string, typeof digests>>((acc, d) => {
    const month = d.date.substring(0, 7);
    if (!acc[month]) acc[month] = [];
    acc[month].push(d);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <h1 className="font-heading text-2xl font-bold mb-8">
        {dict.archive.title}
      </h1>
      {Object.entries(grouped)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([month, items]) => (
          <section key={month} className="mb-8">
            <h2 className="text-sm font-semibold text-primary/80 mb-3 font-mono tracking-wider">
              {locale === "zh"
                ? `${month.replace("-", "年")}月`
                : new Date(month + "-01").toLocaleDateString("en", {
                    year: "numeric",
                    month: "long",
                  })}
            </h2>
            <ul className="space-y-2">
              {items.map((d) => (
                <li key={d.slug}>
                  <Link
                    href={`/${locale}/digest/${d.slug}`}
                    className="group flex items-start gap-3 rounded-md p-2 -mx-2 hover:bg-muted/50 transition-colors"
                  >
                    <time className="font-mono text-xs text-muted-foreground shrink-0 pt-0.5">
                      {d.date}
                    </time>
                    <span className="text-sm group-hover:text-primary transition-colors line-clamp-2">
                      {d.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      {digests.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {dict.archive.noResults}
        </p>
      )}
    </div>
  );
}
