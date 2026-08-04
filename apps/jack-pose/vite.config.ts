import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// 与 scripts/build-vendor.mjs 中打进 /vendor/*.js 的库清单保持一致。
// 构建时 external 这些库，由 index.html 的 importmap 指向全局共享的 /vendor/ 文件，
// 与 studio / wave / tan 复用同一份 React 实例。
const VENDOR_EXTERNAL = ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react-router-dom']

export default defineConfig(({ command }) => ({
  base: '/projects/jack-pose/',
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
    chunkSizeWarningLimit: 1500,
    // Vite 8 使用 Rolldown 打包；Rolldown 不读 rollupOptions.external，必须把 external
    // 放到 rolldownOptions.external，否则 react/react-dom 会被重新打进各自的 chunk（此处被
    // 拉进了 state-vendor），导致跨应用无法复用 /vendor/*.js 的同一份 React 实例。
    rolldownOptions: {
      ...(command === 'build' ? { external: VENDOR_EXTERNAL } : {}),
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/zustand') || id.includes('node_modules/sonner')) {
            return 'state-vendor'
          }
        },
      },
    },
  },
}))
