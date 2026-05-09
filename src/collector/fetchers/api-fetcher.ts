import type { SourceDefinition } from "@/lib/types";
import type { RawItem } from "./rss-fetcher";

interface ApiSourceConfig {
  endpoint?: string;
  dataPath?: string;
  titleField?: string;
  linkField?: string;
  contentField?: string;
  dateField?: string;
}

export async function fetchApiSource(
  source: SourceDefinition,
): Promise<RawItem[]> {
  const config = source as SourceDefinition & ApiSourceConfig;
  const endpoint = config.endpoint || source.url;

  console.log(`  Fetching API: ${endpoint}`);

  const response = await fetch(endpoint, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    );
  }

  const json = await response.json();
  const items = extractArray(json, config.dataPath);

  return items.map((raw) => {
    const item = raw as Record<string, unknown>;
    return {
      sourceId: source.id,
      sourceName: source.name,
      title: String(item[config.titleField || "title"] || ""),
      link: String(item[config.linkField || "link"] || source.url),
      content: String(item[config.contentField || "description"] || ""),
      contentSnippet: String(
        item[config.contentField || "description"] || "",
      ).slice(0, 500),
      pubDate: String(
        item[config.dateField || "pubDate"] || new Date().toISOString(),
      ),
    };
  });
}

function extractArray(data: unknown, path?: string): unknown[] {
  if (!path) {
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") {
      for (const val of Object.values(data)) {
        if (Array.isArray(val)) return val;
      }
    }
    return [];
  }

  const keys = path.split(".");
  let current: unknown = data;
  for (const key of keys) {
    if (current && typeof current === "object" && current !== null) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return [];
    }
  }
  return Array.isArray(current) ? current : [];
}
