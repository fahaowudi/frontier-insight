import { loadDomainConfig } from "@/lib/config";
import { fetchAllSources } from "@/collector/fetchers";
import { normalizeRawItems } from "@/collector/normalizer";
import { saveRawItems, digestExists } from "@/collector/storage";

const DOMAIN = process.env.DOMAIN || "science";
const DATE = process.env.DATE || new Date().toISOString().split("T")[0];

async function main() {
  console.log(`\n=== Dry Run Pipeline: ${DATE} | Domain: ${DOMAIN} ===\n`);

  const config = loadDomainConfig(DOMAIN);

  // Check existing
  for (const locale of config.site.locales) {
    const exists = digestExists(DATE, locale);
    console.log(`  ${locale}/${DATE}: ${exists ? "EXISTS" : "NOT FOUND"}`);
  }

  // Fetch sources (no AI needed)
  console.log("\n--- Fetching sources ---");
  const results = await fetchAllSources(config.sources);

  if (results.length === 0) {
    console.log("No sources returned data.");
    return;
  }

  // Normalize and save raw items
  console.log("\n--- Normalizing ---");
  let totalItems = 0;
  for (const result of results) {
    const normalized = normalizeRawItems(
      result.items,
      result.source.weight,
      result.source.language,
    );
    saveRawItems(DATE, result.source.id, normalized);
    totalItems += normalized.length;
  }
  console.log(`Total items: ${totalItems}`);

  console.log("\n=== Dry run complete (no AI generation) ===\n");
}

main().catch((err) => {
  console.error("Dry run failed:", err);
  process.exit(1);
});
