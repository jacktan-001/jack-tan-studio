// Vitest 全局 setup —— 补齐 jsdom 缺失的浏览器 API
// 部分被测工具（theme / effects）会读取 matchMedia / localStorage，这里做最小垫片。

if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}
