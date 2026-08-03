import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// TODO: 复制模板后，将 base 替换为实际子路径，例如 /projects/jack-lens/
export default defineConfig({
  base: '/projects/template/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@jack-tan/studio-core': resolve(__dirname, '../../packages/studio-core/src/index.ts'),
    },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1500,
  },
})
