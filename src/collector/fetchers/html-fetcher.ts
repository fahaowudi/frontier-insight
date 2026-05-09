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
  const items = extractArticles(markdown, source);

  if (items.length === 0) {
    return [
      {
        sourceId: source.id,
        sourceName: source.name,
        title: extractTitle(markdown) || source.name,
        link: source.url,
        content: markdown,
        contentSnippet: truncate(markdown, 500),
        pubDate: new Date().toISOString(),
      },
    ];
  }

  return items;
}

interface ArticleCandidate {
  title: string;
  link: string;
  snippet: string;
}

function extractArticles(
  markdown: string,
  source: SourceDefinition,
): RawItem[] {
  const candidates = parseListItems(markdown, source.url);
  return candidates.map((c) => ({
    sourceId: source.id,
    sourceName: source.name,
    title: c.title,
    link: c.link,
    content: c.snippet,
    contentSnippet: truncate(c.snippet, 500),
    pubDate: new Date().toISOString(),
  }));
}

function parseListItems(markdown: string, baseUrl: string): ArticleCandidate[] {
  const results: ArticleCandidate[] = [];
  const lines = markdown.split("\n");

  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;

  let currentTitle = "";
  let currentLink = "";
  let currentSnippet = "";
  let collecting = false;

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,4})\s+(.+)/);
    if (headingMatch) {
      if (collecting && currentTitle) {
        results.push(
          finishItem(currentTitle, currentLink, currentSnippet, baseUrl),
        );
      }
      const headingText = headingMatch[2];
      const linkInHeading = headingText.match(/\[([^\]]+)\]\(([^)]+)\)/);

      if (linkInHeading) {
        currentTitle = linkInHeading[1].trim();
        currentLink = linkInHeading[2].trim();
      } else {
        currentTitle = headingText.replace(/[*_`]/g, "").trim();
        const inlineLinks = [...headingText.matchAll(linkPattern)];
        if (inlineLinks.length > 0) {
          currentLink = inlineLinks[0][2].trim();
        } else {
          currentLink = "";
        }
      }
      currentSnippet = "";
      collecting = true;
      continue;
    }

    const listItemMatch = line.match(/^\s*[-*]\s+(.+)/);
    if (listItemMatch) {
      if (collecting && currentTitle) {
        results.push(
          finishItem(currentTitle, currentLink, currentSnippet, baseUrl),
        );
      }

      const itemText = listItemMatch[1];
      const linkMatch = itemText.match(/\[([^\]]+)\]\(([^)]+)\)/);

      if (linkMatch) {
        currentTitle = linkMatch[1].trim();
        currentLink = linkMatch[2].trim();
        currentSnippet = itemText
          .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
          .trim();
      } else {
        currentTitle = itemText.replace(/[*_`]/g, "").trim();
        currentLink = "";
        currentSnippet = itemText.replace(/[*_`]/g, "").trim();
      }
      collecting = true;
      continue;
    }

    if (collecting && line.trim()) {
      currentSnippet += (currentSnippet ? " " : "") + line.trim();
      if (currentSnippet.length > 300) {
        currentSnippet = currentSnippet.slice(0, 300);
      }
    }
  }

  if (collecting && currentTitle) {
    results.push(
      finishItem(currentTitle, currentLink, currentSnippet, baseUrl),
    );
  }

  return results.filter(
    (r) =>
      r.title.length > 3 &&
      r.title.length < 300 &&
      !isNavJunk(r.title) &&
      !isStaticUrl(r.link),
  );

  function isNavJunk(title: string): boolean {
    const lower = title.toLowerCase();
    return (
      lower.startsWith("skip to") ||
      lower.startsWith("menu") ||
      lower.startsWith("navigation") ||
      lower.startsWith("toggle") ||
      lower.startsWith("close") ||
      lower.startsWith("open") ||
      lower.startsWith("search") ||
      /^!\[image/i.test(title) ||
      /^image\s*\d+/i.test(title)
    );
  }

  function isStaticUrl(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|svg|css|js|ico|webp|mp4|pdf)(\?|$)/i.test(url);
  }
}

function finishItem(
  title: string,
  link: string,
  snippet: string,
  baseUrl: string,
): ArticleCandidate {
  let resolvedLink = link;
  if (link && !link.startsWith("http")) {
    try {
      resolvedLink = new URL(link, baseUrl).href;
    } catch {
      resolvedLink = link;
    }
  }
  return {
    title: cleanTitle(title),
    link: resolvedLink || baseUrl,
    snippet: snippet || title,
  };
}

function extractTitle(md: string): string {
  const match = md.match(/^#\s+(.+)/m);
  return match?.[1] ? cleanTitle(match[1]) : "";
}

function cleanTitle(raw: string): string {
  return raw
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // remove ![alt](url)
    .replace(/\[[^\]]*\]\([^)]*\)/g, "$1") // keep link text
    .replace(/[*_`#]/g, "")
    .trim();
}

function truncate(text: string, maxLen: number): string {
  const cleaned = text.replace(/[#*_\[\]]/g, "");
  return cleaned.length > maxLen ? cleaned.slice(0, maxLen) : cleaned;
}
