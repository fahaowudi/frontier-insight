import { describe, it, expect } from "vitest";
import {
  loadDomainConfig,
  getSources,
  getEditorialRules,
  getSiteConfig,
  validateConfig,
} from "@/lib/config";

describe("Config Engine", () => {
  describe("loadDomainConfig", () => {
    it("should load the science domain config", () => {
      const config = loadDomainConfig("science");
      expect(config).toBeDefined();
      expect(config.site.domain).toBe("science");
      expect(config.site.name).toBe("Frontier Insight");
    });

    it("should throw for unknown domain", () => {
      expect(() => loadDomainConfig("nonexistent")).toThrow();
    });
  });

  describe("getSiteConfig", () => {
    it("should return site branding info", () => {
      const config = loadDomainConfig("science");
      const site = getSiteConfig(config);
      expect(site.domain).toBe("science");
      expect(site.name).toBe("Frontier Insight");
      expect(site.locales).toEqual(["zh", "en"]);
      expect(site.defaultLocale).toBe("zh");
      expect(site.theme.primaryColor).toBe("#0f172a");
    });
  });

  describe("getSources", () => {
    it("should return all sources for a domain", () => {
      const config = loadDomainConfig("science");
      const sources = getSources(config);
      expect(sources.length).toBeGreaterThan(0);
    });

    it("each source should have required fields", () => {
      const config = loadDomainConfig("science");
      const sources = getSources(config);
      for (const source of sources) {
        expect(source).toHaveProperty("id");
        expect(source).toHaveProperty("name");
        expect(source).toHaveProperty("url");
        expect(source).toHaveProperty("type");
        expect(source).toHaveProperty("weight");
        expect(source.weight).toBeGreaterThanOrEqual(0);
        expect(source.weight).toBeLessThanOrEqual(3);
      }
    });

    it("should filter sources by language", () => {
      const config = loadDomainConfig("science");
      const zhSources = getSources(config, { language: "zh" });
      const enSources = getSources(config, { language: "en" });
      expect(zhSources.every((s) => s.language === "zh")).toBe(true);
      expect(enSources.every((s) => !s.language || s.language === "en")).toBe(
        true,
      );
    });

    it("should filter sources by type", () => {
      const config = loadDomainConfig("science");
      const rssSources = getSources(config, { type: "rss" });
      expect(rssSources.every((s) => s.type === "rss")).toBe(true);
    });
  });

  describe("getEditorialRules", () => {
    it("should return editorial rules with defaults", () => {
      const config = loadDomainConfig("science");
      const rules = getEditorialRules(config);
      expect(rules.dailyFeaturedCount).toBe(3);
      expect(rules.dailyBriefsCount).toBe(10);
      expect(rules.aiPromptContext).toBeTruthy();
    });
  });

  describe("validateConfig", () => {
    it("should validate a correct config without errors", () => {
      const config = loadDomainConfig("science");
      const errors = validateConfig(config);
      expect(errors).toEqual([]);
    });

    it("should report missing required fields", () => {
      const config = loadDomainConfig("science");
      config.site.domain = "";
      const errors = validateConfig(config);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain("domain");
    });

    it("should report sources with invalid weight", () => {
      const config = loadDomainConfig("science");
      config.sources[0].weight = -1;
      const errors = validateConfig(config);
      expect(errors.some((e) => e.includes("weight"))).toBe(true);
    });

    it("should report duplicate source ids", () => {
      const config = loadDomainConfig("science");
      config.sources[1].id = config.sources[0].id;
      const errors = validateConfig(config);
      expect(errors.some((e) => e.includes("duplicate"))).toBe(true);
    });
  });
});
