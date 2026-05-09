import type { DomainConfig } from "@/lib/types";

const emptyConfig: DomainConfig = {
  site: {
    domain: "",
    name: "",
    description: "",
    locales: ["zh", "en"],
    defaultLocale: "zh",
    theme: {
      primaryColor: "#0f172a",
    },
  },
  sources: [],
  editorialRules: {
    dailyFeaturedCount: 3,
    dailyBriefsCount: 10,
    aiPromptContext: "",
  },
};

export default emptyConfig;
