/**
 * Jack Tan Studio Core
 * 共享底座七层架构 — 统一入口
 *
 * Layer 1: Design Tokens  — 设计令牌（颜色/间距/字体/圆角/阴影/动画）
 * Layer 2: Utility        — 工具函数（安全/格式/URL/DOM/设备）
 * Layer 3: Storage        — 存储抽象（localStorage/KV/内存缓存）
 * Layer 4: Theme          — 主题系统（Provider/暗亮模式/项目预设）
 * Layer 5: PWA            — 渐进式 Web 应用（SW/Manifest/安装提示）
 * Layer 6: Deploy Config  — 部署配置（Cloudflare/安全头/重定向）
 * Layer 7: Effects        — 视觉效果（Motion/GSAP/转场/霓虹发光）
 *
 * @jack-tan/studio-core
 */

// Layer 1: Design Tokens
export * from './tokens';

// Layer 2: Utility
export * from './utils';

// Layer 3: Storage
export * from './storage';

// Layer 4: Theme
export * from './theme';

// Layer 4.5: Navigation (cross-project StudioBar)
export * from './nav';

// Layer 4.6: Brand (unified project glyphs + badges)
export * from './brand';

// Layer 5: PWA
export * from './pwa';

// Layer 6: Deploy Config
export * from './deploy';

// Layer 7: Effects
export * from './effects';

// Layer 8: Player (cross-project global audio player)
export * from './player';
