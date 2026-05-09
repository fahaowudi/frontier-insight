import type { NormalizedItem } from "../normalizer";
import type { ClientWithModel } from "./client";
import { buildScoringPrompt } from "./prompts";

export interface ScoredItem extends NormalizedItem {
  score: number;
  relevance: string;
  reason: string;
}

interface ScoreResult {
  index: number;
  score: number;
  relevance: string;
  reason: string;
}

export async function scoreItems(
  items: NormalizedItem[],
  context: string,
  client: ClientWithModel,
): Promise<ScoredItem[]> {
  if (items.length === 0) return [];

  const prompt = buildScoringPrompt(items, context);
  const response = await client.chat.completions.create({
    model: client.defaultModel,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from scorer");

  let scores: ScoreResult[];
  try {
    const parsed = JSON.parse(content);
    scores = Array.isArray(parsed)
      ? parsed
      : parsed.scores || parsed.results || [];
  } catch {
    console.error("Failed to parse scorer response:", content);
    return items.map((item) => ({
      ...item,
      score: 5,
      relevance: "medium",
      reason: "Scoring failed, using default",
    }));
  }

  return items.map((item, i) => {
    const score = scores.find((s) => s.index === i) || {
      score: 5,
      relevance: "medium",
      reason: "Not scored",
    };
    return {
      ...item,
      score: score.score,
      relevance: score.relevance,
      reason: score.reason,
    };
  });
}
