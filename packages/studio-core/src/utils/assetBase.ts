/**
 * assetBase — 可注入的资源基址（单页壳层合并架构必需）
 *
 * 背景：子应用独立部署时 vite 的 `base` 为 `/projects/jack-xxx/`，
 * 代码里用 `import.meta.env.BASE_URL + 'avatar.jpg'` 拼接静态资源与接口。
 * 但当这些源码被 studio 单页外壳直接打包时，`import.meta.env.BASE_URL`
 * 会变成 studio 的 `/`，导致 `/avatar.jpg`、`/api/public-data` 全部 404。
 *
 * 解决：每个子应用创建一份自己的基址状态（闭包，互不干扰），
 * 默认取自身构建期的 BASE_URL；被外壳挂载时由 bootstrap 调用
 * `setAssetBase('/projects/jack-xxx/')` 覆盖，从而两种形态都指向正确路径。
 */

export interface AssetBaseApi {
  /** 覆盖资源基址（嵌入外壳时由 bootstrap 在 mount 之前调用） */
  setAssetBase: (next: string) => void;
  /** 读取当前基址（始终以 `/` 结尾） */
  getAssetBase: () => string;
  /** 基于当前基址拼接资源 / 接口地址，例：assetUrl('api/submit') */
  assetUrl: (path: string) => string;
}

/** 规范化为以 `/` 结尾的基址 */
function normalize(base: string): string {
  if (!base) return '/';
  return base.endsWith('/') ? base : base + '/';
}

/**
 * 创建一份独立的资源基址状态。
 * 每个子应用调用一次并导出结果，闭包隔离，互不污染。
 */
export function createAssetBase(defaultBase: string): AssetBaseApi {
  let base = normalize(defaultBase);

  return {
    setAssetBase(next: string) {
      base = normalize(next);
    },
    getAssetBase() {
      return base;
    },
    assetUrl(path: string) {
      return base + path.replace(/^\/+/, '');
    },
  };
}
