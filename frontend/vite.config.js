import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env variables from system process + env files
  const env = loadEnv(mode, process.cwd(), '')
  const isVercel = env.VERCEL === '1' || env.VERCEL === 'true' || process.env.VERCEL === '1' || process.env.VERCEL === 'true' || env.CI === 'true' || env.CI === '1';

  return {
    plugins: [react()],
    base: isVercel ? '/' : '/static/',
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
        '/media': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
      },
    },
  }
})
