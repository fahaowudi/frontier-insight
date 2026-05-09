import fs from "fs";
import path from "path";
import type { Digest } from "@/lib/types";
import type { NormalizedItem } from "./normalizer";

const CONTENT_DIR = path.join(process.cwd(), "content");
const RAW_DIR = path.join(CONTENT_DIR, "raw");
const DIGESTS_DIR = path.join(CONTENT_DIR, "digests");

export function saveRawItems(
  date: string,
  sourceId: string,
  items: NormalizedItem[],
): void {
  const dir = path.join(RAW_DIR, date);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, `${sourceId}.json`),
    JSON.stringify(items, null, 2),
  );
}

export function loadRawItems(date: string): NormalizedItem[] {
  const dir = path.join(RAW_DIR, date);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .flatMap(
      (f) =>
        JSON.parse(
          fs.readFileSync(path.join(dir, f), "utf-8"),
        ) as NormalizedItem[],
    );
}

export function saveDigest(digest: Digest): void {
  const localeDir = path.join(DIGESTS_DIR, digest.locale);
  if (!fs.existsSync(localeDir)) fs.mkdirSync(localeDir, { recursive: true });
  const filePath = path.join(localeDir, `${digest.date}.json`);
  fs.writeFileSync(filePath, JSON.stringify(digest, null, 2));
  console.log(`Saved: ${filePath}`);
}

export function digestExists(date: string, locale: string): boolean {
  const filePath = path.join(DIGESTS_DIR, locale, `${date}.json`);
  return fs.existsSync(filePath);
}
