# Jack Tan Studio

个人创意工作室 Monorepo —— 门户 + 多子应用统一部署。

[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-jacktan--studio-f38020?logo=cloudflare)](https://jacktan-studio.pages.dev)

## 项目愿景

把 Jack Wave（音乐随记）、Jack Pose（社媒排版）、Jack Tan（个人主页）以及未来的 Jack Lens / Jack Cast / JackCraft 整合到同一个门户下，统一品牌、统一导航、独立部署路径。

## 技术栈

- **Monorepo**：pnpm 10 workspaces + Turborepo 2
- **前端**：React 19 + TypeScript 5.8 + Vite 8（Rolldown）+ Tailwind CSS v4
- **动画**：Motion（motion/react）、GSAP、CSS View Transitions API
- **部署**：Cloudflare Pages + Functions，单 Pages 项目合并产物
- **CI/CD**：GitHub Actions（typecheck → build → merge → 路由校验 → 产物断言 → 部署）

## 仓库结构

```text
jack-tan-studio/
├── apps/
│   ├── studio/          # 门户首页（根路径 /）
│   ├── jack-wave/       # 音乐随记（/projects/jack-wave/）
│   ├── jack-pose/       # 社媒排版（/projects/jack-pose/）
│   ├── jack-tan/        # 个人主页（/projects/jack-tan/）
│   └── project-template/# 子应用脚手架（阶段三新增）
├── packages/
│   └── studio-core/     # 共享层：主题、PWA、部署配置、工具函数
├── scripts/
│   └── merge-dist.mjs   # 合并产物到 deploy/dist
└── deploy/              # Cloudflare Pages 部署产物
```

## 路由映射

| 路径 | 应用 | 说明 |
| --- | --- | --- |
| `/` | studio | 门户首页 |
| `/projects/jack-wave/*` | jack-wave | 音乐随记（SPA 回退） |
| `/projects/jack-pose/*` | jack-pose | 社媒排版（HashRouter） |
| `/projects/jack-tan/*` | jack-tan | 个人主页 |
| `/projects/:id/intro` | studio | 项目介绍页 |
| `/projects/:id`（已上线） | — | 301 到对应子应用 |
| `/projects/:id`（未上线） | studio | 显示 Coming Soon |
| `/jack-wave/*` 等旧路径 | — | 301 永久重定向到新规范 URL |
| 其余未匹配路径 | — | `404.html` + 真实 404 状态码 |

> **`_redirects` 规则顺序是有语义的**：`/projects/:id/intro` 必须排在旧路径 301 之前。
> 否则 `/projects/wave/intro` 会被 `/projects/wave/*` 规则劫持到子应用（该 bug 已于 2026-08-04 修复）。
> 全部规则由 `scripts/merge-dist.mjs` 依据 `apps/studio/src/data/projects.ts` 自动生成，请勿手写。

## 本地开发

```bash
# 安装依赖
pnpm install

# 启动所有应用（turbo dev）
pnpm dev

# 单独启动某个应用
pnpm dev:studio
pnpm dev:wave
pnpm dev:pose
pnpm dev:tan

# 构建全部
pnpm build

# 合并产物（生成 deploy/dist）
pnpm merge

# 类型检查 / 代码检查
pnpm typecheck
pnpm lint
```

## 构建与部署

```bash
# 1. 构建全部子应用
pnpm build

# 2. 合并产物并生成 _redirects / _routes.json / _headers
pnpm merge

# 3. 部署到 Cloudflare Pages
pnpm wrangler pages deploy deploy/dist --project-name jacktan-studio
```

## 访问分析（Web Analytics）

站点已接入 Cloudflare Web Analytics，两种启用方式二选一：

**方式 A（推荐，零代码）：Cloudflare Pages 原生集成**
进入 Cloudflare 控制台 → `jacktan-studio` Pages 项目 → **Settings → Analytics** → 开启 **Web Analytics**。
Cloudflare 会自动向所有页面注入 beacon，无需改动任何代码。

**方式 B（CI 驱动，可控）：环境变量注入**
1. 在 Cloudflare 控制台 **Web Analytics** 产品下新建一个站点，复制其 `token`；
2. 在 GitHub 仓库 **Settings → Secrets** 中添加 `CLOUDFLARE_WEB_ANALYTICS_TOKEN`；
3. CI 的 `pnpm merge` 步骤会读取该变量，向根路径与三个子应用的 `index.html` 注入
   `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"..."}'></script>`。
   未设置该变量时自动跳过，本地构建不受任何影响。

> 两种方式不要同时启用，否则会出现两个 beacon 重复上报。
> 无论哪种方式，`_headers` 的 CSP 已放行 `static.cloudflareinsights.com`（script-src）
> 与 `cloudflareinsights.com`（connect-src），根策略与 jack-pose 严格策略均已覆盖。

## 工程约定

1. **子应用资源路径**：必须使用相对路径或 `import.meta.env.BASE_URL`，禁止写死 `/filename.ext`，否则子路径部署会 404。
2. **子应用不渲染 StudioBar**：每个子应用自己管理主题切换按钮，避免双重导航栏。
3. **主题系统**：通过 `@jack-tan/studio-core` 的 `ThemeProvider` 设置 `data-project`，由 `theme.css` 映射为项目色。
4. **跨应用跳转**：Navbar 使用原生 `<a>` 跳转 + View Transitions API，实现伪 SPA 体验。
5. **路由与 SEO 单一数据源**：`projects.ts` 是唯一事实来源，`_redirects` / `sitemap.xml` 均由
   `merge-dist.mjs` 自动派生。新增项目只需改 `projects.ts`，不要手动维护部署配置。
6. **子应用 public/ 下不要放 `robots.txt` / `sitemap.xml`**：合并部署为单 origin 后只有根级文件生效，
   子应用副本不可达且极易残留失效域名（历史事故）。SEO 文件统一在 `merge-dist.mjs` 中生成。
7. **禁止本地 `wrangler pages deploy` 直发生产**：一律走 `main` 分支 CI，
   由流水线注入 `--commit-hash` / `--commit-message`，保证线上版本可追溯到具体 commit。
8. **依赖版本禁止写 `latest`**：必须使用明确的语义化范围，否则构建不可复现。

## 站点 origin 变更清单

绑定自定义域名时，以下位置需同步修改（当前值 `https://jacktan-studio.pages.dev`）：

- `scripts/merge-dist.mjs` 的 `SITE_ORIGIN` 常量（robots.txt / sitemap.xml 由此派生）
- 四个 `apps/*/index.html` 中的 `canonical`、`og:url`、`og:image`、`twitter:image`
- `.github/workflows/ci.yml` 中产物校验步骤的 robots 断言字符串

## 阶段二 / 三 关键改动

- 导航栏重构为「全局导航 + 产品矩阵」两层。
- 新增 `/projects/:id/intro` 项目介绍页。
- 引入 View Transitions API 跨应用过渡。
- Navbar 悬停项目时预览目标项目主题色，并通过 `localStorage` 传递主题 hint。
- `ThemeProvider` 消费 pending project hint，子应用可感知是否从 Studio 进入。
- 添加 `apps/project-template` 子应用脚手架。
- 添加 `scripts/verify-routes.mjs` 路由一致性检查，并接入 GitHub Actions CI 质量门禁。

## 阶段三：架构演进（Router Worker + 多 Pages）

当前采用「单 Cloudflare Pages 项目 + merge-dist 合并产物」模式，适合 3-4 个已上线应用。当 Jack Lens / Jack Cast / JackCraft 陆续上线后，建议迁移到以下架构：

```text
用户请求 → Router Worker → Service Bindings → 各子应用 Pages 项目
                    ↓
            HTMLRewriter 注入统一导航栏 + 主题 CSS
```

### 拆分后的 Pages 项目规划

| Pages 项目 | 源码路径 | 部署路径 | Build Watch Paths |
| --- | --- | --- | --- |
| `jacktan-studio` | `apps/studio` | `/` | `apps/studio/*, packages/studio-core/*` |
| `jacktan-wave` | `apps/jack-wave` | `/projects/jack-wave/` | `apps/jack-wave/*, packages/studio-core/*` |
| `jacktan-pose` | `apps/jack-pose` | `/projects/jack-pose/` | `apps/jack-pose/*, packages/studio-core/*` |
| `jacktan-tan` | `apps/jack-tan` | `/projects/jack-tan/` | `apps/jack-tan/*, packages/studio-core/*` |
| `jacktan-lens` | `apps/jack-lens` | `/projects/jack-lens/` | `apps/jack-lens/*, packages/studio-core/*` |

### Build Watch Paths 配置

在每个 Pages 项目的 Cloudflare Dashboard → Settings → Build & deployments → Build watch paths 中配置：

```text
Include: apps/jack-wave/*, packages/studio-core/*
Exclude: apps/jack-pose/*, apps/jack-tan/*, apps/studio/*
```

这样修改 Jack Wave 不会触发 Pose / Tan / Studio 的重复构建。配合 Turborepo Remote Caching 可进一步缩短 CI 时间。

### Router Worker 职责

- 按路径分发给对应 Pages 项目（Service Bindings）。
- 用 `HTMLRewriter` 在子应用 HTML 中注入统一导航栏、主题 CSS、`View Transitions` 兼容层。
- 重写静态资源路径前缀，确保子应用独立部署时资源不 404。

> 当前阶段暂不拆分 Pages 项目，保留单 Pages 合并部署。拆分前需要先在 Dashboard 中完成 Build Watch Paths 和 Service Bindings 配置。

## 许可证

MIT © Jack Tan
