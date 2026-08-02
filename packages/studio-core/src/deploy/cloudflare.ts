/**
 * Layer 6: Deploy Config — Cloudflare Pages 配置
 * 部署配置类型与生成工具
 */

export interface CloudflarePagesConfig {
  /** 构建命令 */
  buildCommand: string;
  /** 构建输出目录 */
  buildOutput: string;
  /** 根目录 */
  rootDir?: string;
  /** 环境变量 */
  envVars?: Record<string, string>;
  /** KV 命名空间绑定 */
  kvNamespaces?: string[];
  /** D1 数据库绑定 */
  d1Databases?: string[];
  /** R2 存储桶绑定 */
  r2Buckets?: string[];
}

/** 项目级 Cloudflare Pages 配置 */
export const deployConfigs: Record<string, CloudflarePagesConfig> = {
  studio: {
    buildCommand: 'pnpm build',
    buildOutput: 'dist',
    rootDir: 'apps/studio',
    kvNamespaces: ['STUDIO_KV'],
  },
  wave: {
    buildCommand: 'pnpm build',
    buildOutput: 'dist',
    rootDir: 'apps/jack-wave',
    kvNamespaces: ['WAVE_KV'],
  },
  pose: {
    buildCommand: 'pnpm build',
    buildOutput: 'dist',
    rootDir: 'apps/jack-pose',
    kvNamespaces: ['POSE_KV'],
  },
  tan: {
    buildCommand: 'pnpm build',
    buildOutput: 'dist',
    rootDir: 'apps/jack-tan',
  },
};

/** wrangler.toml 模板生成 */
export function generateWranglerConfig(projectId: string): string {
  const config = deployConfigs[projectId] ?? deployConfigs.studio;
  const lines: string[] = [
    `name = "${projectId}"`,
    `compatibility_date = "2024-12-01"`,
    `pages_build_output_dir = "${config.buildOutput}"`,
  ];
  if (config.kvNamespaces?.length) {
    lines.push('');
    for (const ns of config.kvNamespaces) {
      lines.push(`[[kv_namespaces]]`);
      lines.push(`binding = "${ns}"`);
      lines.push(`id = "YOUR_KV_NAMESPACE_ID"`);
      lines.push('');
    }
  }
  if (config.d1Databases?.length) {
    lines.push('');
    for (const db of config.d1Databases) {
      lines.push(`[[d1_databases]]`);
      lines.push(`binding = "${db}"`);
      lines.push(`database_name = "${db.toLowerCase()}"`);
      lines.push(`database_id = "YOUR_D1_DATABASE_ID"`);
      lines.push('');
    }
  }
  return lines.join('\n');
}
