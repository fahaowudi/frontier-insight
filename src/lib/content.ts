import fs from "fs";
import path from "path";
import type { Digest } from "@/lib/types";

const CONTENT_DIR = path.join(process.cwd(), "content", "digests");
const MOCKS_DIR = path.join(process.cwd(), "src", "__mocks__", "digests");

function loadDigestsFromDir(dir: string): Digest[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map(
      (f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8")) as Digest,
    )
    .sort((a, b) => b.date.localeCompare(a.date));
}

const cache = new Map<string, Digest[]>();

function getDigests(locale: string): Digest[] {
  if (cache.has(locale)) return cache.get(locale)!;

  // Prefer content/ directory (pipeline output)
  const contentDir = path.join(CONTENT_DIR, locale);
  let digests = loadDigestsFromDir(contentDir);

  // Fall back to __mocks__ for development
  if (digests.length === 0) {
    const mocksDir = path.join(MOCKS_DIR, locale);
    digests = loadDigestsFromDir(mocksDir);
  }

  cache.set(locale, digests);
  return digests;
}

export function getAllDigests(locale: string): Digest[] {
  return getDigests(locale);
}

export function getDigestBySlug(locale: string, slug: string): Digest | null {
  return getDigests(locale).find((d) => d.slug === slug) ?? null;
}

export function getLatestDigest(locale: string): Digest | null {
  return getDigests(locale)[0] ?? null;
}

export function clearCache(): void {
  cache.clear();
}
