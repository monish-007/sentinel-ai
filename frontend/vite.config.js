import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// BEST PRACTICE:
// Local dev uses Vite's proxy to forward /api requests to localhost:3001
// Production ignores this and uses the absolute VITE_API_URL instead
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
