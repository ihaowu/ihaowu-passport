import path from 'path'

import { defineConfig } from 'vite'

import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  alias: {
    // 为什么 sass-bem 模块无法识别，工作区的问题？？？
    'sass-bem': path.resolve(__dirname, '../../node_modules/sass-bem'),
    '@': path.resolve(__dirname, 'src'),
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        join: path.resolve(__dirname, 'join.html'),
        active_account: path.resolve(__dirname, 'active_account.html')
      }
    }
  },
  plugins: [vue(), vueJsx()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:7100',
        changeOrigin: true
      },
      '/app': {
        target: 'http://localhost:7100',
        changeOrigin: true
      },
    },
  },
})
