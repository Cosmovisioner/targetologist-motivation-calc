import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages project site: /targetologist-motivation-calc/
  base: process.env.NODE_ENV === 'production' ? '/targetologist-motivation-calc/' : '/',
})
