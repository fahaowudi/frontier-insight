import { loadDomainConfig } from "@/lib/config";
import { fetchAllSources } from "@/collector/fetchers";
import { normalizeRawItems, deduplicateByTitle } from "@/collector/normalizer";
import type { NormalizedItem } from "@/collector/normalizer";
import { saveRawItems, saveDigest, digestExists } from "@/collector/storage";
import { scoreItems } from "@/collector/ai/scorer";
import { synthesizeDigest } from "@/collector/ai/synthesizer";
import {
  createScorerClient,
  createGeneratorClient,
} from "@/collector/ai/client";

const DOMAIN = process.env.DOMAIN || "science";
const DATE = process.env.DATE || new Date().toISOString().split("T")[0];

async function main() {
  console.log(`\n=== Pipeline: ${DATE} | Domain: ${DOMAIN} ===\n`);

  const config = loadDomainConfig(DOMAIN);
  const locales = config.site.locales;

  // Check if already generated
  if (locales.every((l) => digestExists(DATE, l))) {
    console.log(`Digests for ${DATE} already exist, skipping.`);
    return;
  }

  // Step 1: Fetch all sources
  console.log("\n--- Step 1: Fetching sources ---");
  const results = await fetchAllSources(config.sources);
  if (results.length === 0) {
    console.error("No sources returned data. Aborting.");
    return;
  }

  // Step 2: Normalize, deduplicate, pre-filter
  console.log("\n--- Step 2: Normalizing ---");
  const allItems = results.flatMap((r) =>
    normalizeRawItems(r.items, r.source.weight, r.source.language),
  );
  console.log(`Total normalized items: ${allItems.length}`);

  for (const result of results) {
    const normalized = normalizeRawItems(
      result.items,
      result.source.weight,
      result.source.language,
    );
    saveRawItems(DATE, result.source.id, normalized);
  }

  // Pre-filter: per-source limit
  const totalNeeded =
    config.editorialRules.dailyFeaturedCount +
    config.editorialRules.dailyBriefsCount;
  const maxPerSource = Math.ceil(totalNeeded / results.length) * 3;
  const grouped = new Map<string, NormalizedItem[]>();
  for (const item of allItems) {
    const list = grouped.get(item.sourceId) || [];
    list.push(item);
    grouped.set(item.sourceId, list);
  }
  const capped = Array.from(grouped.values()).flatMap((items) =>
    items.slice(0, maxPerSource),
  );
  console.log(`After per-source cap (${maxPerSource}): ${capped.length} items`);

  // Deduplicate by title
  const deduped = deduplicateByTitle(capped);
  console.log(`After title dedup: ${deduped.length} items`);

  // Step 3: Score items
  console.log("\n--- Step 3: Scoring ---");
  const scorerClient = createScorerClient();
  const scored = await scoreItems(
    deduped,
    config.editorialRules.aiPromptContext,
    scorerClient,
  );
  const sorted = scored.sort((a, b) => b.score - a.score);
  console.log(
    `Top items: ${sorted
      .slice(0, 5)
      .map((s) => `"${s.title.slice(0, 30)}..." (${s.score})`)
      .join(", ")}`,
  );

  // Step 4: Generate digests in parallel for each locale
  console.log("\n--- Step 4: Generating digests ---");
  const generatorClient = createGeneratorClient();

  const pending = locales.filter((l) => !digestExists(DATE, l));
  if (pending.length === 0) {
    console.log("All locales already exist.");
  } else {
    const digests = await Promise.all(
      pending.map(async (locale) => {
        console.log(`  ${locale}: synthesizing...`);
        const digest = await synthesizeDigest(
          sorted,
          DATE,
          config,
          generatorClient,
          locale,
        );
        saveDigest(digest);
        console.log(
          `  ${locale}: ${digest.articles.length} articles, ${digest.quickNews.length} quick news`,
        );
        return digest;
      }),
    );
    console.log(`Generated ${digests.length} locale(s): ${pending.join(", ")}`);
  }

  console.log(`\n=== Pipeline complete for ${DATE} ===\n`);
}

main().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
