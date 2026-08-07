/**
 * Layer 8: Player — 封面解析器注册表
 *
 * 单页壳层（studio）持有唯一的 player 实例与 <audio> 元素。
 * 被嵌入到壳层的子应用（如 jack-wave）拥有自己的封面解析逻辑
 *（如 Apple 图床走同源 /api/img 代理），但壳层本身不知道。
 *
 * 约定：子应用在被 mount 时调用 setArtworkResolver(自己的解析器)，
 * unmount 时调用 setArtworkResolver(null) 复位。壳层的 player 在需要解析封面时
 * 通过 getArtworkResolver() 取得当前嵌入应用的解析器；若未注册则回退到 safeUrl。
 *
 * 这样既能保证全局只有一个 <audio>（真正零间隙），又能让每个子应用保留自己的封面逻辑。
 */

let registered: ((url: string) => string) | null = null;

/** 注册当前嵌入子应用的封面解析器（传 null 复位） */
export function setArtworkResolver(fn: ((url: string) => string) | null): void {
  registered = fn;
}

/** 读取当前注册的封面解析器（可能为空） */
export function getArtworkResolver(): ((url: string) => string) | null {
  return registered;
}
