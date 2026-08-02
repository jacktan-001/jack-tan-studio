# Jack Tan Studio — Cloudflare Pages 部署指南

## 架构概览

```
jack-tan-studio/                    # Monorepo Root
├── packages/studio-core/           # 共享七层基础包
├── apps/studio/                    # Studio 门户应用
├── apps/jack-pose/                 # 图片排版工具
├── apps/jack-wave/                 # 音乐日志（含 Functions）
├── apps/jack-tan/                  # 个人作品集
├── turbo.json                      # Turborepo 构建编排
└── pnpm-workspace.yaml             # pnpm 工作区配置
```

每个应用可独立部署到 Cloudflare Pages，共享 studio-core 设计系统但互不依赖。

---

## 前置准备

### 1. 安装 CLI 工具

```bash
# 安装 Wrangler（Cloudflare CLI）
npm install -g wrangler@latest

# 登录 Cloudflare
wrangler login

# 安装 pnpm（如未安装）
npm install -g pnpm@9
```

### 2. 创建 GitHub 仓库

```bash
# 在 jack-tan-studio 根目录
git init
git add .
git commit -m "feat: initial monorepo setup"
git remote add origin git@github.com:jacktan-001/jack-tan-studio.git
git push -u origin main
```

---

## 各应用部署配置

### Studio 门户

| 配置项 | 值 |
|--------|-----|
| 项目名称 | `jack-tan-studio` |
| 构建命令 | `pnpm install && pnpm build:studio` |
| 构建输出目录 | `apps/studio/dist` |
| 根目录 | `.` (monorepo root) |
| Node 版本 | 20 |

### Jack Pose

| 配置项 | 值 |
|--------|-----|
| 项目名称 | `jack-pose` |
| 构建命令 | `pnpm install && pnpm build:pose` |
| 构建输出目录 | `apps/jack-pose/dist` |
| 根目录 | `.` (monorepo root) |

### Jack Wave

| 配置项 | 值 |
|--------|-----|
| 项目名称 | `jack-wave` |
| 构建命令 | `pnpm install && pnpm build:wave` |
| 构建输出目录 | `apps/jack-wave/dist` |
| 根目录 | `.` (monorepo root) |
| Functions 目录 | `apps/jack-wave/functions` |

### Jack Tan

| 配置项 | 值 |
|--------|-----|
| 项目名称 | `jack-tan` |
| 构建命令 | `pnpm install && pnpm build:tan` |
| 构建输出目录 | `apps/jack-tan/dist` |
| 根目录 | `.` (monorepo root) |

---

## Cloudflare Pages 创建步骤

### 方式一：通过 Wrangler CLI 创建

```bash
# Studio 门户
wrangler pages project create jack-tan-studio \
  --production-branch main

# Jack Pose
wrangler pages project create jack-pose \
  --production-branch main

# Jack Wave
wrangler pages project create jack-wave \
  --production-branch main

# Jack Tan
wrangler pages project create jack-tan \
  --production-branch main
```

### 方式二：通过 Cloudflare Dashboard 创建

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. 选择 GitHub 仓库 `jacktan-001/jack-tan-studio`
4. 按上表填写构建配置

---

## KV 命名空间配置

Jack Wave 需要 KV 存储音乐数据：

```bash
# 创建 KV 命名空间
wrangler kv namespace create WAVE_KV

# 输出示例：
# id = "abc123def456..."
# 绑定到 Jack Wave 项目
```

在 Cloudflare Dashboard → Pages → jack-wave → Settings → Functions → KV namespace bindings：

| 变量名 | KV 命名空间 |
|--------|------------|
| `WAVE_KV` | jack-wave-kv |

---

## 环境变量

在 Cloudflare Dashboard → 各项目 → Settings → Environment variables：

### Jack Wave 环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `ADMIN_TOKEN` | 管理后台认证 Token | `your-secret-token` |
| `WAVE_KV` | KV 命名空间绑定 | (自动绑定) |

---

## 部署命令

### 手动部署（本地构建 + 上传）

```bash
# 构建并部署 Studio
pnpm build:studio
wrangler pages deploy apps/studio/dist --project-name jack-tan-studio

# 构建并部署 Jack Pose
pnpm build:pose
wrangler pages deploy apps/jack-pose/dist --project-name jack-pose

# 构建并部署 Jack Wave
pnpm build:wave
wrangler pages deploy apps/jack-wave/dist --project-name jack-wave

# 构建并部署 Jack Tan
pnpm build:tan
wrangler pages deploy apps/jack-tan/dist --project-name jack-tan
```

### 一键部署全部

```bash
# 构建所有应用
pnpm build

# 逐个部署
wrangler pages deploy apps/studio/dist --project-name jack-tan-studio
wrangler pages deploy apps/jack-pose/dist --project-name jack-pose
wrangler pages deploy apps/jack-wave/dist --project-name jack-wave
wrangler pages deploy apps/jack-tan/dist --project-name jack-tan
```

---

## GitHub Actions 自动部署

已配置 `.github/workflows/deploy.yml`，push 到 `main` 分支时自动构建并部署所有应用。

### CI/CD 流程

1. Push 到 `main` → GitHub Actions 触发
2. 安装 pnpm + Node 20
3. `pnpm install` 安装依赖
4. `pnpm build` 构建所有应用
5. 逐个部署到 Cloudflare Pages

### 所需 GitHub Secrets

在 GitHub 仓库 → Settings → Secrets and variables → Actions：

| Secret 名 | 说明 |
|-----------|------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token（需 Pages 编辑权限） |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID |
| `WAVE_ADMIN_TOKEN` | Jack Wave 管理后台 Token |

### 获取 API Token

1. 访问 [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Create Token → Custom token
3. 权限：Account → Cloudflare Pages → Edit
4. 复制 Token 到 GitHub Secrets

---

## 自定义域名

在 Cloudflare Dashboard → 各 Pages 项目 → Custom domains：

| 应用 | 建议域名 |
|------|---------|
| Studio | `studio.jacktan.dev` (或现有域名) |
| Jack Pose | `pose.jacktan.dev` |
| Jack Wave | `wave.jacktan.dev` (或保留现有 `jack-wave.pages.dev`) |
| Jack Tan | `jacktan.dev` (或保留现有域名) |

---

## 本地开发

```bash
# 启动所有应用
pnpm dev

# 启动单个应用
pnpm dev:studio    # → http://localhost:5173
pnpm dev:pose      # → http://localhost:5174
pnpm dev:wave      # → http://localhost:5175
pnpm dev:tan       # → http://localhost:5176

# 预览生产构建
pnpm preview:studio  # → http://localhost:4173
pnpm preview:pose    # → http://localhost:4174
pnpm preview:wave    # → http://localhost:4175
pnpm preview:tan     # → http://localhost:4176
```

---

## 构建产物分析

| 应用 | JS 大小 | Gzip | CSS | Gzip |
|------|---------|------|-----|------|
| Studio | 253 KB | 79 KB | 12 KB | 4 KB |
| Jack Pose | 192 KB | 61 KB | 32 KB | 7 KB |
| Jack Wave | 264 KB | 80 KB | 11 KB | 4 KB |
| Jack Tan | 224 KB | 71 KB | 21 KB | 5 KB |

> Jack Pose 的 heic2any 库（1.3 MB）已通过动态 import 按需加载，不影响首屏。

---

## 安全头配置

每个应用的 `public/_headers` 文件已配置：

- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()
- 资源缓存策略（assets 1 年 immutable，HTML no-cache）

---

## 故障排查

### 构建失败

```bash
# 清理缓存重新构建
pnpm clean
pnpm install
pnpm build
```

### 部署失败

```bash
# 检查 Wrangler 登录状态
wrangler whoami

# 查看项目列表
wrangler pages project list
```

### KV 绑定不生效

确认在 Cloudflare Dashboard 中正确配置了 KV namespace binding，变量名必须与代码中一致（如 `WAVE_KV`）。

### Functions 不工作

Jack Wave 的 Functions 位于 `apps/jack-wave/functions/`，确保 Cloudflare Pages 项目的 Functions 根目录配置正确。
