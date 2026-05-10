# 架构概览

## 系统架构

```
┌─────────────────────────────────────────────────┐
│                  数据管道层                        │
│  GitHub Actions (每日 02:00 CST)                  │
│                                                   │
│  RSS/HTML 源 → 规范化 → 预过滤 → AI 评分           │
│                          → AI 生成摘要 → JSON      │
│                          → git push               │
└──────────────────────┬──────────────────────────┘
                       │ content/digests/*.json
                       ▼
┌─────────────────────────────────────────────────┐
│                  构建与部署层                      │
│  GitHub Actions (push main)                       │
│                                                   │
│  Next.js 静态导出 → Pagefind 索引                  │
│  → Sitemap → RSS → Cloudflare Pages              │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│                  前端展现层                        │
│  Next.js 16 App Router + React 19                 │
│  Tailwind CSS 4 + shadcn/ui                      │
│  明暗模式 · 中英双语 · 响应式                      │
└─────────────────────────────────────────────────┘
```

## 数据流

1. **抓取**：`src/collector/fetchers/` — RSS 解析 + Jina Reader API + 通用 JSON API
2. **规范化**：`src/collector/normalizer.ts` — ID 哈希、语言检测、标题去重
3. **预过滤**：`scripts/run-pipeline.ts` — 每源限量 + 规则过滤（长度、导航垃圾、图片 URL）
4. **AI 评分**：`src/collector/ai/scorer.ts` — GLM-5.1 多维打分（科学意义/公众兴趣/新颖性/信源权威）
5. **AI 生成**：`src/collector/ai/synthesizer.ts` — 深度文章（3 篇）+ 快讯（10 条），中英双语
6. **存储**：`content/digests/{locale}/{date}.json`
7. **构建**：`content.ts` 读取 JSON → Next.js 静态页面 → Pagefind 索引
8. **部署**：Cloudflare Pages 全球 CDN

## 配置驱动

整个站点由 `config/domains/science.config.ts` 驱动：

- **sources[]**：定义数据源（RSS/HTML/API）、权重、语言
- **editorialRules**：每日精选数量、快讯数量、AI 上下文
- **site**：站点名、描述、语言列表

替换配置文件即可生成不同垂直领域的站点。

## AI 配置

评分和生成使用独立的客户端，可通过环境变量配置不同模型：

- `SCORER_*`：评分用模型（默认 GLM-5.1）
- `GENERATOR_*`：生成用模型（默认 GLM-5.1）

## 路由结构

| 路由                      | 说明               |
| ------------------------- | ------------------ |
| `/`                       | 重定向到 `/zh/`    |
| `/{locale}/`              | 首页（今日摘要）   |
| `/{locale}/archive`       | 存档页（按月分组） |
| `/{locale}/digest/{slug}` | 摘要详情页         |
| `/{locale}/search`        | Pagefind 全文搜索  |
| `/{locale}/methodology`   | 方法论页           |

## 关键设计决策

- **静态导出**：`output: "export"`，所有页面构建时生成，无服务器运行时
- **oklch 色彩系统**：teal 主色 + copper 点缀，CSS 自定义属性实现明暗主题
- **系统字体栈**：不用 Google Fonts（中国被墙），Georgia 做标题
- **串行 AI 请求**：智谱 AI 有速率限制，批量评分需按批次串行 + 延迟
