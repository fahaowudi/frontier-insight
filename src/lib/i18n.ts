import zhDict from "../../config/i18n/zh.json";
import enDict from "../../config/i18n/en.json";

export type Locale = "zh" | "en";

type Dictionary = typeof zhDict;

const dictionaries: Record<string, Dictionary> = {
  zh: zhDict,
  en: enDict,
};

const DEFAULT_LOCALE: Locale = "zh";

export function loadDictionary(locale: string): Dictionary {
  return (dictionaries[locale] || dictionaries[DEFAULT_LOCALE]) as Dictionary;
}

export function t(
  dict: Dictionary,
  keyPath: string,
  vars?: Record<string, string>,
): string {
  const keys = keyPath.split(".");
  let result: unknown = dict;
  for (const key of keys) {
    if (result && typeof result === "object" && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return keyPath;
    }
  }

  if (typeof result !== "string") return keyPath;

  if (vars) {
    return Object.entries(vars).reduce(
      (str, [k, v]) => str.replace(`{${k}}`, v),
      result,
    );
  }

  return result;
}

export function getAvailableLocales(): string[] {
  return Object.keys(dictionaries);
}

export function isLocaleSupported(locale: string): boolean {
  return locale in dictionaries;
}
