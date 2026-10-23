import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // Universal relative base for GitHub Pages (works on both /smart-shopping/ and /shopping-list-system/)
  base: './',

  // Multi-page app: index.html + lista.html
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        lista: resolve(__dirname, 'lista.html'),
      },
    },
    outDir: 'dist',
  },

  server: {
    port: 3000,
    open: true,
  },
})
