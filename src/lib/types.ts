export interface SiteBranding {
  domain: string;
  name: string;
  description: string;
  locales: string[];
  defaultLocale: string;
  url?: string;
  theme: {
    primaryColor: string;
  };
}

export interface SourceDefinition {
  id: string;
  name: string;
  url: string;
  type: "rss" | "html" | "api";
  parser?: "jina" | "firecrawl";
  weight: number;
  language?: "zh" | "en";
}

export interface SponsorshipConfig {
  enabled: boolean;
  position: number;
  format: "text" | "card";
}

export interface EditorialRules {
  dailyFeaturedCount: number;
  dailyBriefsCount: number;
  sponsorship?: SponsorshipConfig;
  aiPromptContext: string;
}

export interface DomainConfig {
  site: SiteBranding;
  sources: SourceDefinition[];
  editorialRules: EditorialRules;
}

export interface DigestArticle {
  number: number;
  headline: string;
  summary: string;
  tags: string[];
  sources: SourceRef[];
}

export interface QuickNewsItem {
  text: string;
  source: SourceRef;
}

export interface SourceRef {
  title: string;
  url: string;
  domain: string;
}

export interface Digest {
  date: string;
  locale: string;
  title: string;
  totalSources: number;
  totalArticles: number;
  articles: DigestArticle[];
  quickNews: QuickNewsItem[];
  slug: string;
  meta: {
    generatedAt: string;
    version: string;
    industry: string;
  };
}
