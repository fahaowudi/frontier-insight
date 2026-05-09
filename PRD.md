# 核心产品需求文档 (PRD)：Template-Driven Information OS

> 版本: v1.0 | 状态: 架构对齐与规划阶段

## 一、 产品定位与愿景

本项目本质上不是"开发一个资讯网站"，而是构建一套可复用的「信息聚合与分发基础设施」。通过高度抽象的架构设计，实现"配置即站点"：未来只需替换一份 config.ts 文件，即可零代码改动地生成从"前沿科普"、"AI 行业观察"到"独立开发者周报"等各种垂直领域的专属情报站。

**V1 版本首发领域：全球硬核科普与前沿科技**（涵盖 Nature、国家地理、果壳等顶级源）。

## 二、 核心系统架构

采用极简且低运维的现代化全栈架构，确保后期一个人也能轻松维护多个垂直站点。

| 分层         | 技术选型                                             | 核心职责与优势                                                       |
| ------------ | ---------------------------------------------------- | -------------------------------------------------------------------- |
| 前端展现层   | Next.js 15 (App Router) + Tailwind CSS + shadcn/ui   | 极佳的 SEO 表现，组件化强，适合构建响应式的信息流布局。              |
| 部署与网络   | Cloudflare Pages                                     | 全球 CDN 静态加速，零服务器运维成本，支持高并发访问。                |
| 数据存储层   | Cloudflare D1 (SQLite) 或 Supabase                   | 替代纯 Git JSON 存储，避免历史包袱，支持复杂查询和高频数据写入。     |
| 内容搜索层   | Pagefind                                             | 零后端依赖的纯静态全文检索引擎，与生成式站点完美契合。               |
| 核心数据管道 | Node.js / TypeScript (GitHub Actions 定时触发)       | 负责从全网抓取原始数据，调用 AI 进行清洗和生成，最后写入数据库。     |
| 防爬虫与解析 | RSS Parser + Jina Reader API / Firecrawl             | RSS 处理基础源；Jina/Firecrawl 负责突破反爬虫机制，提取纯净正文。    |
| 双层 AI 引擎 | DeepSeek-V3 / GPT-4o-mini (初筛) + Claude 3.5 (生成) | 低成本模型做海量资讯的评分与过滤，强推理模型做最终的高质量摘要生成。 |

## 三、 核心机制设计：模板配置驱动 (The Template Engine)

整个系统的灵魂在于配置文件。这套结构需要完全独立于前端代码，实现数据的热切换。

以 V1"科普领域"为例，配置文件的核心结构如下：

```typescript
// config/domains/science.config.ts

export const siteConfig = {
  domain: "science",
  name: "Frontier Insight",
  description: "全球前沿科学与硬核科普每日简报",
  locales: ["zh", "en"],
  defaultLocale: "zh",
  theme: {
    primaryColor: "#0f172a", // 可根据行业切换主题色
  },
};

export const sources: SourceConfig[] = [
  // 综合类科普
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

  // 自然与宇宙
  {
    id: "nasa-news",
    name: "NASA",
    url: "https://www.nasa.gov/news-release/",
    type: "api",
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

  // 技术前沿
  {
    id: "mit-tr",
    name: "MIT Technology Review",
    url: "https://www.technologyreview.com",
    type: "html",
    parser: "firecrawl",
    weight: 1.5,
  },

  // 中文硬核源
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
];

// 编辑与 AI 生成规则
export const editorialRules = {
  dailyFeaturedCount: 3, // 每日深度解读 3 篇
  dailyBriefsCount: 10, // 每日一句话快讯 10 条
  aiPromptContext:
    "你是一位顶级科普专栏作家。请将这些科学进展转化为高中生也能理解的通俗语言，保留核心原理解释。",
};
```

## 四、 自动化数据管道 (Data Pipeline)

这是系统的"发动机"，每天定时运行（例如凌晨 2 点），无需人工干预。

1. **信息抓取 (Fetch & Bypass)**：读取 sources 配置。简单源直读 RSS，复杂页面（如 MIT TR）交由 Jina Reader 转化为 Markdown。
2. **多维评分与初筛 (Score & Filter)**：交叉验证：如果 Nature 和 Live Science 同一天都报道了某个天文发现，权重叠加。AI 降噪：调用极低成本大模型，快速判断抓取内容是否属于"核心科普"或"硬核科研"，剔除无用公关稿。
3. **高质量生成 (AI Synthesize)**：提取排名前 3 的事件，调用高级 AI 生成《深度摘要》（包含：现象、原理解释、未来影响）。提取排名 4-13 的事件，生成《一句话快讯》。
4. **入库与部署触发 (Store & Trigger)**：结构化数据存入 Supabase，并调用 webhook 触发 Cloudflare Pages 重新构建静态页面 (SSG)。

## 五、 页面与交互规范 (UI/UX 矩阵)

严格遵循 **Mobile First（移动端优先）** 原则，确保碎片化阅读体验。

### 首页 (Home)

- **Hero 模块**：展示网站 Slogan 及今日大盘数据（例如："今日已从 15 个顶级科学源处理 320 篇文献，提炼出 3 篇深度洞察"）。
- **核心信息流**：按天折叠的卡片列表。每张卡片展示：大标题、AI 一句话摘要、核心标签（如 物理、航天）、原始出处及链接。

### 聚合详情页 (Digest Detail)

- 优雅的 Markdown 渲染排版。
- **来源溯源区**：清晰展示这篇生成的文章参考了哪些原始链接（保证权威性和防幻觉）。

### 存档与检索 (Archive & Search)

- 基于 Pagefind 的全局极速搜索（支持中文分词）。
- 日历热力图形式的历史存档页。

### 响应式规范 (Breakpoints)

- **Mobile (<640px)**：单列，底部沉浸式 Tab 导航，卡片全屏宽。
- **Tablet & PC (>640px)**：双列布局（左侧导航树/信息源列表，右侧核心信息流），限制最大阅读宽度以保证眼动舒适区。

## 六、 商业与生态扩展性设计

作为独立项目，必须在代码层面预留增长和变现的钩子。

### 极致 SEO (SSR/SSG)

每篇日报生成独立的静态 URL（如 /zh/digest/2026-05-08-nasa-new-discovery），并自动生成 Sitemap 和结构化数据（JSON-LD），截获搜索引擎长尾流量。

### 原生广告/赞助位接入

在配置系统的 editorialRules 中预留 sponsorship 字段。AI 生成时，自动在快讯列表的第 3 条之后，自然插入一条极简的赞助商纯文本推广。

### 多渠道分发口

系统后期可直接拓展输出 RSS Feed，或接入 Resend API 实现邮件简报（Newsletter）自动派发。
