import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { marked } from 'marked'

function markdownToHtml() {
  return {
    name: 'vite-plugin-md-to-html',
    transform(code, id) {
      if (!id.endsWith('.md')) return
      const html = marked(code)
      return `export default ${JSON.stringify(html)}`
    },
  }
}

export default defineConfig({
  plugins: [vue(), markdownToHtml()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
})
