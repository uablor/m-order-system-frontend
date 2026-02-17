import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  build: {
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
})
