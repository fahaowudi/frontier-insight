import type { Digest, SiteBranding } from "@/lib/types";

export function generateWebsiteJsonLd(site: SiteBranding) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    description: site.description,
    url: site.url,
    inLanguage: site.locales,
  };
}

export function generateArticleJsonLd(digest: Digest, site: SiteBranding) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: digest.title,
    datePublished: digest.date,
    author: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
    publisher: {
      "@type": "Organization",
      name: site.name,
    },
    description: digest.articles[0]?.summary?.slice(0, 200),
    inLanguage: digest.locale,
    url: `${site.url}/${digest.locale}/digest/${digest.slug}/`,
  };
}

export function getBaseUrl(site: SiteBranding): string {
  return site.url || "https://frontierinsight.dev";
}
