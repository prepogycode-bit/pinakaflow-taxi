import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' makes the built site work from ANY location -
// https://username.github.io/repo-name/, a custom domain root, or a local file.
// Do not change it unless you know you need an absolute base path.
export default defineConfig({
  plugins: [react()],
  base: './',
})
