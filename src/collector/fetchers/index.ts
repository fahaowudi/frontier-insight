import type { SourceDefinition } from "@/lib/types";
import type { RawItem } from "./rss-fetcher";
import { fetchRssSource } from "./rss-fetcher";
import { fetchHtmlSource } from "./html-fetcher";
import { fetchApiSource } from "./api-fetcher";

export type { RawItem };

export async function fetchSource(
  source: SourceDefinition,
): Promise<RawItem[]> {
  switch (source.type) {
    case "rss":
      return fetchRssSource(source);
    case "html":
      return fetchHtmlSource(source);
    case "api":
      return fetchApiSource(source);
    default:
      console.warn(`Unknown source type "${source.type}" for "${source.id}"`);
      return [];
  }
}

export async function fetchAllSources(
  sources: SourceDefinition[],
): Promise<{ source: SourceDefinition; items: RawItem[] }[]> {
  const results = await Promise.allSettled(
    sources.map(async (source) => {
      console.log(`Fetching: ${source.name} (${source.type})...`);
      const items = await fetchSource(source);
      console.log(`  → ${items.length} items from ${source.name}`);
      return { source, items };
    }),
  );

  // Log failures for debugging
  for (const r of results) {
    if (r.status === "rejected") {
      console.error(`  ✗ Fetch failed: ${r.reason}`);
    }
  }

  return results
    .filter(
      (
        r,
      ): r is PromiseFulfilledResult<{
        source: SourceDefinition;
        items: RawItem[];
      }> => r.status === "fulfilled",
    )
    .map((r) => r.value)
    .filter((r) => r.items.length > 0);
}
