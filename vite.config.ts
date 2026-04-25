import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Dev proxy เพื่อตัดปัญหา CORS (frontend -> backend)
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
  // Strip all console.* and debugger statements from the production bundle so
  // the payload structure, endpoint strings, and error details are not logged
  // in the browser console of the deployed app.
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  build: {
    // Never ship source maps — they let anyone reconstruct the original source.
    sourcemap: false,
    // Ant Design Vue is large; we still code-split it, but raise warning threshold.
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('ant-design-vue')) return 'antd'
          if (id.includes('@ant-design/icons-vue')) return 'antd-icons'
          if (id.includes('vue-i18n')) return 'i18n'
          if (
            id.includes('/node_modules/vue/') ||
            id.includes('/node_modules/@vue/') ||
            id.includes('/node_modules/vue-router/') ||
            id.includes('/node_modules/pinia/')
          ) {
            return 'vue'
          }
          return 'vendor'
        },
      },
    },
  },
}))
