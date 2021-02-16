import { createApp } from 'vue'
import 'ant-design-vue/dist/antd.css'

import devkit, { handleVueError } from '@/util/devkit'

import App from './App.vue'

devkit.setup()

const app = createApp(App)

// 配置全局错误处理函数
app.config.errorHandler = handleVueError

app.mount('#app')
