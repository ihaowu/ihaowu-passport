import { createApp } from 'vue'
import 'ant-design-vue/dist/antd.css'

import devkit, { handleVueError, handleAppError } from '@/util/devkit'

import App from './App.vue'

export function runApp() {
  const app = createApp(App)

  app.config.errorHandler = handleVueError

  app.mount('#app')
}

devkit.setup().then(runApp).catch(handleAppError)
