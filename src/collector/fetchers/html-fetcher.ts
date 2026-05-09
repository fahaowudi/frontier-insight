import type { SourceDefinition } from "@/lib/types";
import type { RawItem } from "./rss-fetcher";

export async function fetchHtmlViaJina(url: string): Promise<string> {
  const response = await fetch(`https://r.jina.ai/${url}`, {
    headers: {
      Accept: "text/markdown",
      "X-Return-Format": "markdown",
    },
    signal: AbortSignal.timeout(60000),
  });
  if (!response.ok) {
    throw new Error(`Jina Reader failed for ${url}: ${response.status}`);
  }
  return response.text();
}

export async function fetchHtmlSource(
  source: SourceDefinition,
): Promise<RawItem[]> {
  const markdown = await fetchHtmlViaJina(source.url);
  return [
    {
      sourceId: source.id,
      sourceName: source.name,
      title: extractTitle(markdown) || source.name,
      link: source.url,
      content: markdown,
      contentSnippet: markdown.slice(0, 500).replace(/[#*_\[\]]/g, ""),
      pubDate: new Date().toISOString(),
    },
  ];
}

function extractTitle(md: string): string {
  const match = md.match(/^#\s+(.+)/m);
  return match?.[1] || "";
}
