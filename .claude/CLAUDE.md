# 信息收集者 / Frontier Insight

AI 驱动的科学新闻聚合站，"配置即站点"架构。

## 技术栈

- Next.js 16 (App Router, `output: "export"`) + React 19 + TypeScript 6
- Tailwind CSS 4 + shadcn/ui + oklch 色彩系统（teal 主色 + copper 点缀）
- 明暗模式：localStorage + `prefers-color-scheme`，根 layout 内联脚本防闪烁
- 字体：系统字体栈（Georgia serif 标题 + 系统无衬线正文），**不用 Google Fonts**
- 静态搜索：Pagefind（构建后生成索引）
- AI：GLM-5.1（智谱 AI），OpenAI 兼容接口

## 项目结构

```
config/domains/     ← 领域配置（science.config.ts）
config/i18n/        ← 中英文字典
src/app/            ← Next.js App Router 页面
src/components/     ← UI 组件（cards/, layout/, search/, interactive/）
src/lib/            ← 工具库（content.ts, config.ts, seo.ts, types.ts）
src/collector/      ← 数据管道（fetchers/, ai/, normalizer.ts, storage.ts）
src/__mocks__/      ← 开发用 mock 数据
scripts/            ← pipeline, sitemap, RSS 生成脚本
content/digests/    ← 管道输出的每日摘要 JSON
```

## 常用命令

```bash
npm run dev          # 开发服务器 (http://localhost:3000)
npm run build        # 静态构建 + sitemap + RSS
npm run pipeline     # 运行完整数据管道（需要 AI API key）
npm run pipeline:dry # 跳过 AI 生成的测试运行
npm run test         # Vitest 测试
```

## 环境变量

```bash
# AI 评分（GLM-5.1 智谱 AI）
SCORER_API_KEY=xxx
SCORER_BASE_URL=https://open.bigmodel.cn/api/paas/v4
SCORER_MODEL=glm-5.1

# AI 生成（可独立配置不同模型）
GENERATOR_API_KEY=xxx
GENERATOR_BASE_URL=https://open.bigmodel.cn/api/paas/v4
GENERATOR_MODEL=glm-5.1

# 构建
SITE_URL=https://frontierinsight.dev
```

## 部署

- Cloudflare Pages: `frontier-insight.pages.dev`
- GitHub: https://github.com/fahaowudi/frontier-insight
- CI/CD: push main 自动构建部署；每日凌晨 2 点 CST 自动运行管道

## 红线

- **不用 Google Fonts**：中国被墙，会导致页面加载失败
- **不用 `npm ci`**：lockfile 在 Windows/npm 11 下生成，CI 上不兼容，用 `npm install`
- **管道 AI 请求必须串行**：智谱 AI 有速率限制，批量评分需按批次串行 + 延迟
- **管道 commit 前必须 `git stash` → `git pull --rebase` → `git stash pop`**：避免与远程冲突
