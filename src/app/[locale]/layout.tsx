import type { Metadata } from "next";
import { loadDictionary } from "@/lib/i18n";
import { loadDomainConfig } from "@/lib/config";
import { getBaseUrl } from "@/lib/seo";
import { SiteNav } from "@/components/layout/SiteNav";
import { Footer } from "@/components/layout/Footer";
import { BottomTabNav } from "@/components/layout/BottomTabNav";

export async function generateStaticParams() {
  return [{ locale: "zh" }, { locale: "en" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const config = loadDomainConfig("science");
  const baseUrl = getBaseUrl(config.site);
  return {
    title: config.site.name,
    description: config.site.description,
    openGraph: {
      title: config.site.name,
      description: config.site.description,
      type: "website",
      locale: locale === "zh" ? "zh_CN" : "en_US",
      siteName: config.site.name,
      url: `${baseUrl}/${locale}/`,
    },
    twitter: {
      card: "summary",
      title: config.site.name,
      description: config.site.description,
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/`,
      languages: {
        zh: `${baseUrl}/zh/`,
        en: `${baseUrl}/en/`,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = loadDictionary(locale);
  const config = loadDomainConfig("science");

  return (
    <>
      <div data-pagefind-ignore>
        <SiteNav locale={locale} dict={dict} siteName={config.site.name} />
      </div>
      <main className="pb-20 sm:pb-0">{children}</main>
      <div data-pagefind-ignore>
        <Footer locale={locale} dict={dict} siteName={config.site.name} />
        <BottomTabNav locale={locale} dict={dict} />
      </div>
    </>
  );
}
