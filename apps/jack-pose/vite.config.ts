import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/projects/jack-pose/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@jack-tan/studio-core': resolve(__dirname, '../../packages/studio-core/src/index.ts'),
    },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1500,
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react-router')
          ) {
            return 'react-vendor'
          }
          if (id.includes('node_modules/zustand') || id.includes('node_modules/sonner')) {
            return 'state-vendor'
          }
        },
      },
    },
  },
})
