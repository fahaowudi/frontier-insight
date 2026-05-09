import Parser from "rss-parser";
import type { SourceDefinition } from "@/lib/types";

export interface RawItem {
  sourceId: string;
  sourceName: string;
  title: string;
  link: string;
  content: string;
  contentSnippet: string;
  pubDate: string;
  author?: string;
  categories?: string[];
}

export async function fetchRssSource(
  source: SourceDefinition,
): Promise<RawItem[]> {
  const parser = new Parser({ timeout: 30000 });
  const feed = await parser.parseURL(source.url);
  return feed.items.map((item) => ({
    sourceId: source.id,
    sourceName: source.name,
    title: item.title || "",
    link: item.link || "",
    content: item.content || item["content:encoded"] || "",
    contentSnippet: item.contentSnippet || "",
    pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
    author: item.creator,
    categories: item.categories?.map(String),
  }));
}
