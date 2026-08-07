/**
 * Jack Wave — 资源基址
 *
 * 独立部署：默认取构建期 BASE_URL（vite base = /projects/jack-wave/）。
 * 嵌入 studio 单页外壳：bootstrap 在 mount 前调用 setAssetBase(EMBED_ASSET_BASE)，
 * 否则被外壳打包后 BASE_URL 会退化成 '/'，导致静态资源与 Functions 接口 404。
 */
import { createAssetBase } from '@jack-tan/studio-core';

/** 合并部署后本应用静态资源 / Pages Functions 所在路径 */
export const EMBED_ASSET_BASE = '/projects/jack-wave/';

export const { setAssetBase, getAssetBase, assetUrl } = createAssetBase(
  import.meta.env.BASE_URL,
);
