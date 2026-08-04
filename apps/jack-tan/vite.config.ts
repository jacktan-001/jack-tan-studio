import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// 与 scripts/build-vendor.mjs 中打进 /vendor/*.js 的库清单保持一致。
// 构建时 external 这些库，由 index.html 的 importmap 指向全局共享的 /vendor/ 文件，
// 与 studio / pose / wave 复用同一份 React 实例。
const VENDOR_EXTERNAL = ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react-router-dom']

export default defineConfig(({ command }) => ({
  base: '/projects/jack-tan/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@jack-tan/studio-core': resolve(__dirname, '../../packages/studio-core/src/index.ts'),
    },
  },
  build: {
    outDir: 'dist',
    ...(command === 'build'
      ? { rollupOptions: { external: VENDOR_EXTERNAL } }
      : {}),
    // Vite 8 使用 Rolldown 打包；Rolldown 不读 rollupOptions.external，必须把 external
    // 放到 rolldownOptions.external，否则 react/react-dom 会被重新打进各自的 chunk。
    rolldownOptions: {
      ...(command === 'build' ? { external: VENDOR_EXTERNAL } : {}),
    },
  },
}))
