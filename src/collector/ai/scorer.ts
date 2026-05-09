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

const BATCH_SIZE = 100;
const BATCH_DELAY_MS = 3000;

export async function scoreItems(
  items: NormalizedItem[],
  context: string,
  client: ClientWithModel,
): Promise<ScoredItem[]> {
  if (items.length === 0) return [];

  if (items.length <= BATCH_SIZE) {
    return scoreBatch(items, context, client);
  }

  const batches: NormalizedItem[][] = [];
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    batches.push(items.slice(i, i + BATCH_SIZE));
  }

  console.log(
    `  Scoring ${items.length} items in ${batches.length} batches...`,
  );

  const allResults: ScoredItem[][] = [];
  for (let i = 0; i < batches.length; i++) {
    console.log(`  Batch ${i + 1}/${batches.length}...`);
    const result = await scoreBatch(batches[i], context, client);
    allResults.push(result);
    if (i < batches.length - 1) {
      await delay(BATCH_DELAY_MS);
    }
  }

  return allResults.flat();
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scoreBatch(
  items: NormalizedItem[],
  context: string,
  client: ClientWithModel,
): Promise<ScoredItem[]> {
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
