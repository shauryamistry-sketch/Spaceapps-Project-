import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Spaceapps-Project-/' : '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(root, 'index.html'),
        marsLanders: resolve(root, 'mars-landers.html'),
      },
    },
  },
}))
