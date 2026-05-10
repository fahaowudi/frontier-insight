# 运维手册

## 冒烟验证

```bash
# 本地开发
npm run dev          # http://localhost:3000
npm run build        # 静态构建
npm run test         # 运行测试

# 管道测试
npm run pipeline:dry # 抓取但不调 AI
npm run pipeline     # 完整管道（需要 .env.local 中的 API key）
```

## 环境变量清单

| 变量                 | 用途                | 必需 | 默认值                                 |
| -------------------- | ------------------- | ---- | -------------------------------------- |
| `SCORER_API_KEY`     | 评分 AI 的 API Key  | 是   | -                                      |
| `SCORER_BASE_URL`    | 评分 AI 的 Base URL | 否   | `https://open.bigmodel.cn/api/paas/v4` |
| `SCORER_MODEL`       | 评分模型名          | 否   | `glm-5.1`                              |
| `GENERATOR_API_KEY`  | 生成 AI 的 API Key  | 是   | -                                      |
| `GENERATOR_BASE_URL` | 生成 AI 的 Base URL | 否   | `https://open.bigmodel.cn/api/paas/v4` |
| `GENERATOR_MODEL`    | 生成模型名          | 否   | `glm-5.1`                              |
| `SITE_URL`           | 站点 URL（构建时）  | 否   | `https://frontierinsight.dev`          |

## CI/CD 管道

### Daily Pipeline（每日自动）

- **触发**：每日 18:00 UTC（北京时间凌晨 2:00）
- **手动触发**：`gh workflow run "Daily Pipeline" -f domain=science -f date=2026-05-10`
- **流程**：抓取 → 规范化 → 预过滤 → AI 评分 → AI 生成 → git push
- **输出**：`content/digests/{zh,en}/{date}.json`
- **预计耗时**：~6 分钟

### Build & Deploy（推送自动）

- **触发**：push 到 main，路径包含 `content/digests/**`, `src/**`, `config/**` 等
- **手动触发**：`gh workflow run "Build & Deploy"`
- **流程**：`npm install` → `npm run build` → Pagefind 索引 → Cloudflare Pages 部署
- **预计耗时**：~1 分钟

## 故障排查

### 管道失败：429 速率限制

智谱 AI 有请求频率限制。检查 `src/collector/ai/scorer.ts` 的 `BATCH_SIZE` 和 `BATCH_DELAY_MS`。

### 构建失败：npm ci Invalid Version

项目 lockfile 在 Windows npm 11 下生成，CI 用 `npm install` 而非 `npm ci`。

### 页面白屏/加载中

检查是否引入了 Google Fonts——中国网络会阻断请求导致页面卡住。

### 管道 push 失败（403）

确认 `.github/workflows/pipeline.yml` 中有 `permissions: contents: write`。

### 管道 push rejected

管道 commit 前需要 stash → pull rebase → stash pop。检查 workflow 中的 git 操作顺序。

## Cloudflare 管理

```bash
wrangler whoami                              # 检查登录状态
wrangler pages deploy out/ --project-name frontier-insight  # 手动部署
```

- Account ID: `0f89a6063e02ec97e86a12499a5c4ca2`
- Project: `frontier-insight`
- 自定义域名: 未配置（账户无 Zone）
