import type { DomainConfig } from "@/lib/types";

const scienceConfig: DomainConfig = {
  site: {
    domain: "science",
    name: "Frontier Insight",
    description: "全球前沿科学与硬核科普每日简报",
    locales: ["zh", "en"],
    defaultLocale: "zh",
    url: "https://frontierinsight.dev",
    theme: {
      primaryColor: "#0f172a",
    },
  },

  sources: [
    {
      id: "howstuffworks",
      name: "HowStuffWorks",
      url: "https://www.howstuffworks.com/rss.xml",
      type: "rss",
      weight: 1.2,
    },
    {
      id: "sci-am",
      name: "Scientific American",
      url: "https://www.scientificamerican.com",
      type: "html",
      parser: "jina",
      weight: 1.5,
    },
    {
      id: "nasa-news",
      name: "NASA",
      url: "https://www.nasa.gov/news-release/",
      type: "html",
      parser: "jina",
      weight: 1.8,
    },
    {
      id: "nature-news",
      name: "Nature News",
      url: "https://www.nature.com/news",
      type: "html",
      parser: "jina",
      weight: 2.0,
    },
    {
      id: "mit-tr",
      name: "MIT Technology Review",
      url: "https://www.technologyreview.com",
      type: "html",
      parser: "firecrawl",
      weight: 1.5,
    },
    {
      id: "guokr",
      name: "果壳网",
      url: "https://www.guokr.com",
      type: "html",
      parser: "jina",
      weight: 1.2,
      language: "zh",
    },
    {
      id: "kepu-cn",
      name: "中国科普博览",
      url: "https://www.kepu.net.cn",
      type: "html",
      weight: 1.5,
      language: "zh",
    },
  ],

  editorialRules: {
    dailyFeaturedCount: 3,
    dailyBriefsCount: 10,
    aiPromptContext:
      "你是一位顶级科普专栏作家。请将这些科学进展转化为高中生也能理解的通俗语言，保留核心原理解释。",
  },
};

export default scienceConfig;
