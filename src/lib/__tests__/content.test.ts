import { describe, it, expect } from "vitest";
import { getAllDigests, getDigestBySlug, getLatestDigest } from "@/lib/content";

describe("Content Loader", () => {
  describe("getAllDigests", () => {
    it("should return digests for a locale", () => {
      const digests = getAllDigests("zh");
      expect(digests.length).toBeGreaterThan(0);
    });

    it("should return digests sorted by date descending", () => {
      const digests = getAllDigests("zh");
      for (let i = 1; i < digests.length; i++) {
        expect(digests[i - 1].date >= digests[i].date).toBe(true);
      }
    });

    it("each digest should have required fields", () => {
      const digests = getAllDigests("zh");
      for (const d of digests) {
        expect(d).toHaveProperty("date");
        expect(d).toHaveProperty("title");
        expect(d).toHaveProperty("slug");
        expect(d).toHaveProperty("totalSources");
        expect(d).toHaveProperty("articles");
        expect(d).toHaveProperty("quickNews");
        expect(d).toHaveProperty("locale");
        expect(d.locale).toBe("zh");
      }
    });

    it("articles should have numbered items 1..N", () => {
      const digests = getAllDigests("zh");
      for (const d of digests) {
        expect(d.articles.length).toBeGreaterThan(0);
        d.articles.forEach((a, i) => {
          expect(a.number).toBe(i + 1);
          expect(a.headline).toBeTruthy();
          expect(a.summary).toBeTruthy();
        });
      }
    });

    it("should return empty for unknown locale", () => {
      const digests = getAllDigests("fr");
      expect(digests).toEqual([]);
    });
  });

  describe("getDigestBySlug", () => {
    it("should find a digest by slug", () => {
      const digests = getAllDigests("zh");
      const first = digests[0];
      const found = getDigestBySlug("zh", first.slug);
      expect(found).toBeDefined();
      expect(found!.slug).toBe(first.slug);
    });

    it("should return null for nonexistent slug", () => {
      const found = getDigestBySlug("zh", "nonexistent-slug");
      expect(found).toBeNull();
    });
  });

  describe("getLatestDigest", () => {
    it("should return the most recent digest", () => {
      const latest = getLatestDigest("zh");
      expect(latest).toBeDefined();
      const allDigests = getAllDigests("zh");
      expect(latest!.date).toBe(allDigests[0].date);
    });

    it("should return null when no digests exist", () => {
      const latest = getLatestDigest("fr");
      expect(latest).toBeNull();
    });
  });
});
