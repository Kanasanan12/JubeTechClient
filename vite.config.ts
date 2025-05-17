import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host:true,
    port:3000,
    allowedHosts: ['jubetech.onrender.com'],
  },
  build: {
    minify: 'esbuild',
  }
})
