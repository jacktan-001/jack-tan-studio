# Jack Tan Studio

个人项目集合 monorepo，集成多个独立应用，共享设计系统与技术栈。

## 技术栈

- **前端框架**: React 19 + TypeScript 5.7 + Vite 6
- **样式**: Tailwind CSS v4 + CSS 变量主题系统
- **动画**: Motion 12 + GSAP 3.12
- **状态**: Zustand
- **后端**: Cloudflare Pages Functions + KV
- **构建**: Turborepo 2 + pnpm 9

## 项目结构

```
jack-tan-studio/
├── packages/studio-core/    # 共享七层基础包
│   ├── tokens/              # 设计令牌（颜色、间距、圆角、字体）
│   ├── utils/               # 工具函数（安全、格式化、DOM、URL）
│   ├── storage/             # 存储抽象（localStorage、KV、缓存）
│   ├── theme/               # 主题系统（ThemeProvider、预设、切换）
│   ├── pwa/                 # PWA 支持（Service Worker、安装提示）
│   ├── deploy/              # 部署配置（安全头、重定向、Cloudflare）
│   └── effects/             # 视觉效果（动效、过渡、霓虹发光）
├── apps/
│   ├── studio/              # Studio 门户（项目导航入口）
│   ├── jack-pose/           # 图片排版工具
│   ├── jack-wave/           # 音乐日志（含 Pages Functions）
│   └── jack-tan/            # 个人作品集
├── turbo.json               # Turborepo 构建编排
└── pnpm-workspace.yaml      # pnpm 工作区配置
```

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动所有应用
pnpm dev

# 启动单个应用
pnpm dev:studio    # http://localhost:5173
pnpm dev:pose      # http://localhost:5174
pnpm dev:wave      # http://localhost:5175
pnpm dev:tan       # http://localhost:5176

# 构建所有应用
pnpm build

# 类型检查
pnpm typecheck
```

## 主题系统

每个应用通过 `ThemeProvider` 注入独特的色彩主题，共享底层设计语言：

| 应用 | projectId | 色系 | 风格 |
|------|-----------|------|------|
| Studio | `studio` | 紫色系 | 科幻科技感 |
| Jack Pose | `pose` | 暖色系 | 手工质感 |
| Jack Wave | `wave` | 冷色系绿色 | 自然流动 |
| Jack Tan | `tan` | 蓝色系 | 商务精炼 |

## 部署

详见 [DEPLOYMENT.md](./DEPLOYMENT.md)
