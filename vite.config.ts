import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/zerion': {
        target: 'https://api.zerion.io/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/zerion/, ''),
      },
      '/api/odos': {
        target: 'https://api.odos.xyz',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/odos/, ''),
      },
    },
  },
})
