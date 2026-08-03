import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/projects/jack-wave/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@jack-tan/studio-core': resolve(__dirname, '../../packages/studio-core/src/index.ts'),
    },
  },
  build: {
    outDir: 'dist',
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor'
          }
          if (id.includes('packages/studio-core')) {
            return 'studio-core'
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
