import { loadDomainConfig } from "@/lib/config";
import { fetchAllSources } from "@/collector/fetchers";
import { normalizeRawItems } from "@/collector/normalizer";
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

  // Step 2: Normalize and save raw items
  console.log("\n--- Step 2: Normalizing ---");
  const allItems = results.flatMap((r) =>
    normalizeRawItems(r.items, r.source.weight, r.source.language),
  );
  console.log(`Total normalized items: ${allItems.length}`);

  // Filter to recent items only (within 48h)
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  const recentItems = allItems.filter((item) => {
    const d = new Date(item.pubDate).getTime();
    return !isNaN(d) && d >= cutoff;
  });
  console.log(
    `Recent items (48h): ${recentItems.length} (filtered out ${allItems.length - recentItems.length} older)`,
  );

  for (const result of results) {
    const normalized = normalizeRawItems(
      result.items,
      result.source.weight,
      result.source.language,
    );
    saveRawItems(DATE, result.source.id, normalized);
  }

  // Step 3: Score items
  console.log("\n--- Step 3: Scoring ---");
  const scorerClient = createScorerClient();
  const scored = await scoreItems(
    recentItems.length > 0 ? recentItems : allItems,
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

  // Step 4: Generate digests for each locale
  console.log("\n--- Step 4: Generating digests ---");
  const generatorClient = createGeneratorClient();

  for (const locale of locales) {
    if (digestExists(DATE, locale)) {
      console.log(`  ${locale}: already exists, skipping`);
      continue;
    }
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
  }

  console.log(`\n=== Pipeline complete for ${DATE} ===\n`);
}

main().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
