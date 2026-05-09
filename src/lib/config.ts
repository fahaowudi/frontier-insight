import type {
  DomainConfig,
  SourceDefinition,
  EditorialRules,
  SiteBranding,
} from "@/lib/types";
import scienceConfig from "../../config/domains/science.config";
import emptyConfig from "../../config/domains/template-empty.config";

const domainRegistry: Record<string, DomainConfig> = {
  science: scienceConfig,
  "template-empty": emptyConfig,
};

export function loadDomainConfig(domain: string): DomainConfig {
  const config = domainRegistry[domain];
  if (!config) {
    throw new Error(
      `Unknown domain: "${domain}". Available: ${Object.keys(domainRegistry).join(", ")}`,
    );
  }
  return structuredClone(config);
}

export function getSiteConfig(config: DomainConfig): SiteBranding {
  return config.site;
}

export function getSources(
  config: DomainConfig,
  filters?: { language?: string; type?: string },
): SourceDefinition[] {
  let sources = config.sources;
  if (filters?.language) {
    sources = sources.filter((s) => s.language === filters.language);
  }
  if (filters?.type) {
    sources = sources.filter((s) => s.type === filters.type);
  }
  return sources;
}

export function getEditorialRules(config: DomainConfig): EditorialRules {
  return config.editorialRules;
}

export function validateConfig(config: DomainConfig): string[] {
  const errors: string[] = [];

  if (!config.site.domain) {
    errors.push("site.domain is required");
  }
  if (!config.site.name) {
    errors.push("site.name is required");
  }
  if (!config.site.locales?.length) {
    errors.push("site.locales must have at least one locale");
  }

  const ids = new Set<string>();
  for (const source of config.sources) {
    if (!source.id) errors.push("source.id is required");
    if (!source.name) errors.push(`source "${source.id}" missing name`);
    if (!source.url) errors.push(`source "${source.id}" missing url`);
    if (source.weight < 0 || source.weight > 3) {
      errors.push(
        `source "${source.id}" weight must be between 0 and 3, got ${source.weight}`,
      );
    }
    if (ids.has(source.id)) {
      errors.push(`duplicate source id: "${source.id}"`);
    }
    ids.add(source.id);
  }

  return errors;
}
