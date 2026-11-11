import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Permite que os testes E2E usem uma API isolada sem mudar a API local normal.
const apiTarget = process.env.NUTRIFLOW_API_TARGET || 'http://localhost:3001'

export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': { target: apiTarget, changeOrigin: true } } },
})
