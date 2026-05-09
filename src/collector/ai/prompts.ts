import type { NormalizedItem } from "../normalizer";
import type { ScoredItem } from "./scorer";

export function buildScoringPrompt(
  items: NormalizedItem[],
  context: string,
): string {
  const itemsText = items
    .map(
      (item, i) =>
        `[${i}] ${item.title}\nSource: ${item.sourceName} | Date: ${item.pubDate}\n${item.body.slice(0, 300)}`,
    )
    .join("\n\n");

  return `You are a science news curator. Score each item 0-10 for:
1. Scientific significance (0-3)
2. Public interest (0-3)
3. Novelty (0-2)
4. Source credibility (0-2)

Editorial context: ${context}

Items:
${itemsText}

Return a JSON array with objects: {"index": number, "score": number, "relevance": "high"|"medium"|"low", "reason": "brief explanation"}
Only return valid JSON, no other text.`;
}

export function buildDeepArticlePrompt(
  context: string,
  item: ScoredItem,
  locale: string,
): string {
  const lang = locale === "zh" ? "Chinese" : "English";
  return `${context}

Write a deep analysis article in ${lang} about this science news:
Title: ${item.title}
Source: ${item.sourceName}
Content: ${item.body}

Return a JSON object with:
{
  "headline": "compelling headline in ${lang}",
  "summary": "3-5 paragraph analysis in ${lang}, separated by \\n",
  "tags": ["tag1", "tag2", "tag3"]
}
Only return valid JSON, no other text.`;
}

export function buildQuickNewsPrompt(
  context: string,
  items: ScoredItem[],
  locale: string,
): string {
  const lang = locale === "zh" ? "Chinese" : "English";
  const itemsText = items
    .map((item, i) => `[${i}] ${item.title}\n${item.body.slice(0, 200)}`)
    .join("\n\n");

  return `${context}

Write a one-sentence summary in ${lang} for each of these science news items:

${itemsText}

Return a JSON array of objects: {"text": "one sentence summary in ${lang}", "sourceIndex": number}
Only return valid JSON, no other text.`;
}
