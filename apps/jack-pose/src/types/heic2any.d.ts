/**
 * heic2any 库的类型声明
 * heic2any 是 UMD 格式的 HEIC/HEIF 图片转换库
 * 安装方式：npm install heic2any
 */

declare module 'heic2any' {
  interface ConvertParams {
    /** 输入的 HEIC/HEIF Blob */
    blob: Blob
    /** 输出格式，默认 'image/jpeg' */
    toType?: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'
    /** 输出质量 (0-1)，仅对 JPEG/WebP 有效 */
    quality?: number
  }

  /**
   * 将 HEIC/HEIF 图片转换为其他格式
   * @param params 转换参数
   * @returns 转换后的图片 Blob
   */
  function heic2any(params: ConvertParams): Promise<Blob>

  export default heic2any
}
