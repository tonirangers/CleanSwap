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
        target: 'https://api.zerion.io',
        changeOrigin: true,
        rewrite: (reqPath) => {
          const u = new URL(reqPath, 'http://localhost')
          return '/v1' + (u.searchParams.get('url') || '')
        },
      },
      '/api/odos': {
        target: 'https://api.odos.xyz',
        changeOrigin: true,
        rewrite: (reqPath) => {
          const u = new URL(reqPath, 'http://localhost')
          return u.searchParams.get('url') || ''
        },
      },
    },
  },
})
