import { describe, it, expect } from "vitest";
import {
  loadDictionary,
  t,
  getAvailableLocales,
  isLocaleSupported,
} from "@/lib/i18n";

describe("i18n", () => {
  describe("loadDictionary", () => {
    it("should load zh dictionary", () => {
      const dict = loadDictionary("zh");
      expect(dict).toBeDefined();
      expect(dict.nav.search).toBe("搜索");
      expect(dict.nav.methodology).toBe("方法论");
    });

    it("should load en dictionary", () => {
      const dict = loadDictionary("en");
      expect(dict).toBeDefined();
      expect(dict.nav.search).toBe("Search");
      expect(dict.nav.methodology).toBe("Methodology");
    });

    it("should fallback to zh for unknown locale", () => {
      const dict = loadDictionary("fr");
      expect(dict.nav.search).toBe("搜索");
    });
  });

  describe("t", () => {
    it("should resolve simple key path", () => {
      const dict = loadDictionary("zh");
      expect(t(dict, "nav.search")).toBe("搜索");
    });

    it("should resolve nested key path", () => {
      const dict = loadDictionary("zh");
      expect(t(dict, "hero.slogan")).toBeTruthy();
    });

    it("should interpolate variables", () => {
      const dict = loadDictionary("zh");
      const result = t(dict, "digest.filteredFrom", { count: "89" });
      expect(result).toBe("从 89 条资讯中筛选");
    });

    it("should interpolate multiple variables", () => {
      const dict = loadDictionary("zh");
      const result = t(dict, "hero.stats", {
        sourceCount: "15",
        articleCount: "320",
        featuredCount: "3",
      });
      expect(result).toContain("15");
      expect(result).toContain("320");
      expect(result).toContain("3");
    });

    it("should return key path for missing keys", () => {
      const dict = loadDictionary("zh");
      expect(t(dict, "nonexistent.key")).toBe("nonexistent.key");
    });
  });

  describe("getAvailableLocales", () => {
    it("should return zh and en", () => {
      const locales = getAvailableLocales();
      expect(locales).toContain("zh");
      expect(locales).toContain("en");
    });
  });

  describe("isLocaleSupported", () => {
    it("should return true for supported locales", () => {
      expect(isLocaleSupported("zh")).toBe(true);
      expect(isLocaleSupported("en")).toBe(true);
    });

    it("should return false for unsupported locales", () => {
      expect(isLocaleSupported("fr")).toBe(false);
    });
  });
});
