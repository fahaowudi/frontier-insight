import type { DomainConfig, Digest } from "@/lib/types";
import type { ScoredItem } from "./scorer";
import type { ClientWithModel } from "./client";
import { buildDeepArticlePrompt, buildQuickNewsPrompt } from "./prompts";

interface ArticleResult {
  headline: string;
  summary: string;
  tags: string[];
}

interface QuickNewsResult {
  text: string;
  sourceIndex: number;
}

export async function synthesizeDigest(
  scoredItems: ScoredItem[],
  date: string,
  config: DomainConfig,
  client: ClientWithModel,
  locale: string,
): Promise<Digest> {
  const rules = config.editorialRules;
  const topCount = rules.dailyFeaturedCount;
  const briefCount = rules.dailyBriefsCount;

  const topItems = scoredItems.slice(0, topCount);
  const briefItems = scoredItems.slice(topCount, topCount + briefCount);

  // Generate deep articles sequentially to avoid rate limits
  const articles: NonNullable<Awaited<ReturnType<typeof generateArticle>>>[] =
    [];
  for (let i = 0; i < topItems.length; i++) {
    const article = await generateArticle(
      client,
      config,
      topItems[i],
      locale,
      i + 1,
    );
    if (article) articles.push(article);
    if (i < topItems.length - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  // Generate quick news
  const quickNews = await generateQuickNews(client, config, briefItems, locale);

  const allSources = scoredItems.slice(0, topCount + briefCount);
  const domain = config.site.domain;
  const siteName = config.site.name;
  const titleTemplate =
    locale === "zh"
      ? `${date} ${siteName}日报`
      : `${siteName} Daily Digest — ${date}`;

  return {
    date,
    locale,
    title: titleTemplate,
    totalSources: new Set(allSources.map((s) => s.sourceId)).size,
    totalArticles: scoredItems.length,
    articles,
    quickNews,
    slug: `${date}-${domain}-digest`,
    meta: {
      generatedAt: new Date().toISOString(),
      version: "1.0",
      industry: config.site.domain,
    },
  };
}

async function generateArticle(
  client: ClientWithModel,
  config: DomainConfig,
  item: ScoredItem,
  locale: string,
  number: number,
) {
  try {
    const prompt = buildDeepArticlePrompt(
      config.editorialRules.aiPromptContext,
      item,
      locale,
    );
    const response = await client.chat.completions.create({
      model: client.defaultModel,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    const result = JSON.parse(content) as ArticleResult;
    return {
      number,
      headline: result.headline || item.title,
      summary: result.summary || item.body,
      tags: result.tags?.slice(0, 5) || [],
      sources: [
        {
          title: item.title,
          url: item.sourceUrl,
          domain: new URL(item.sourceUrl).hostname,
        },
      ],
    };
  } catch (err) {
    console.error(`Failed to generate article #${number}:`, err);
    return {
      number,
      headline: item.title,
      summary: item.body,
      tags: [],
      sources: [
        {
          title: item.title,
          url: item.sourceUrl,
          domain: new URL(item.sourceUrl).hostname,
        },
      ],
    };
  }
}

async function generateQuickNews(
  client: ClientWithModel,
  config: DomainConfig,
  items: ScoredItem[],
  locale: string,
): Promise<Digest["quickNews"]> {
  if (items.length === 0) return [];

  try {
    const prompt = buildQuickNewsPrompt(
      config.editorialRules.aiPromptContext,
      items,
      locale,
    );
    const response = await client.chat.completions.create({
      model: client.defaultModel,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return items.map(fallbackQuickNews);

    const parsed = JSON.parse(content);
    const results = (
      Array.isArray(parsed) ? parsed : parsed.items || parsed
    ) as QuickNewsResult[];
    const list: QuickNewsResult[] = Array.isArray(results) ? results : [];

    return list.map((r: QuickNewsResult) => {
      const source = items[r.sourceIndex] || items[0];
      return {
        text: r.text,
        source: {
          title: source.title,
          url: source.sourceUrl,
          domain: new URL(source.sourceUrl).hostname,
        },
      };
    });
  } catch (err) {
    console.error("Failed to generate quick news:", err);
    return items.map(fallbackQuickNews);
  }
}

function fallbackQuickNews(item: ScoredItem) {
  return {
    text: item.title,
    source: {
      title: item.title,
      url: item.sourceUrl,
      domain: new URL(item.sourceUrl).hostname,
    },
  };
}
