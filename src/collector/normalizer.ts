import { createHash } from "crypto";
import type { RawItem } from "./fetchers";

export interface NormalizedItem {
  id: string;
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  title: string;
  body: string;
  pubDate: string;
  language: string;
  weight: number;
}

export function normalizeRawItems(
  items: RawItem[],
  weight: number,
  defaultLanguage = "en",
): NormalizedItem[] {
  return items.map((item) => ({
    id: hashItem(item.sourceId, item.link),
    sourceId: item.sourceId,
    sourceName: item.sourceName,
    sourceUrl: item.link,
    title: item.title,
    body: item.contentSnippet || item.content?.slice(0, 1000) || "",
    pubDate: item.pubDate,
    language: detectLanguage(
      item.title + " " + item.contentSnippet,
      defaultLanguage,
    ),
    weight,
  }));
}

function hashItem(sourceId: string, link: string): string {
  return createHash("md5")
    .update(`${sourceId}:${link}`)
    .digest("hex")
    .slice(0, 12);
}

function detectLanguage(text: string, fallback: string): string {
  const zhChars = (text.match(/[一-鿿]/g) || []).length;
  const totalChars = text.replace(/\s/g, "").length || 1;
  return zhChars / totalChars > 0.1 ? "zh" : fallback;
}
