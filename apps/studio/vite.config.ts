import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// 与 scripts/build-vendor.mjs 中打进 /vendor/*.js 的库清单保持一致。
// 这些库在「构建」时被 external，由 index.html 的 importmap 指向全局共享的 /vendor/ 文件，
// 使 studio / wave / pose / tan 四个应用复用同一份 React 实例（否则会触发 "Invalid hook call"）。
const VENDOR_EXTERNAL = ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'react-router-dom']

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@jack-tan/studio-core': resolve(__dirname, '../../packages/studio-core/src/index.ts'),
      // 单页壳层：studio 在客户端路由进入子应用时，直接打包其子应用源码
      // （而非整页跳转到独立部署产物），从而全局只有一个 <audio>，导航零间隙。
      'jack-wave': resolve(__dirname, '../jack-wave/src'),
      'jack-pose': resolve(__dirname, '../jack-pose/src'),
      'jack-tan': resolve(__dirname, '../jack-tan/src'),
    },
  },
  server: {
    // 允许 Vite 读取 monorepo 内其他应用的源码（被嵌入的子应用）
    fs: { allow: [resolve(__dirname, '..', '..')] },
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
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/motion')) {
            return 'motion-vendor'
          }
        },
      },
    },
  },
}))
