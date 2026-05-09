import { loadDictionary } from "@/lib/i18n";
import { loadDomainConfig } from "@/lib/config";
import { getAllDigests, getLatestDigest } from "@/lib/content";
import { generateWebsiteJsonLd } from "@/lib/seo";
import { FeaturedCard } from "@/components/cards/FeaturedCard";
import { ArticleCard } from "@/components/cards/ArticleCard";
import { HeroSection } from "@/components/layout/HeroSection";
import { SubscribeForm } from "@/components/interactive/SubscribeForm";
import Link from "next/link";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = loadDictionary(locale);
  const config = loadDomainConfig("science");
  const latest = getLatestDigest(locale);
  const allDigests = getAllDigests(locale);
  const olderDigests = allDigests.slice(1);
  const jsonLd = generateWebsiteJsonLd(config.site);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-4 space-y-8">
        <HeroSection dict={dict} siteName={config.site.name} latest={latest} />

        {latest && <FeaturedCard digest={latest} locale={locale} dict={dict} />}

        {olderDigests.length > 0 && (
          <section className="space-y-3">
            {olderDigests.map((digest) => (
              <ArticleCard
                key={digest.slug}
                digest={digest}
                locale={locale}
                dict={dict}
              />
            ))}
          </section>
        )}

        <div className="text-center">
          <Link
            href={`/${locale}/archive`}
            className="text-sm text-primary hover:underline"
          >
            {dict.archive.viewAll} &rarr;
          </Link>
        </div>

        <SubscribeForm dict={dict} siteName={config.site.name} />
      </div>
    </>
  );
}
