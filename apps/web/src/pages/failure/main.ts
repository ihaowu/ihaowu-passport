import { createApp } from 'vue'

import App from './App.vue'

export function runApp() {
  return createApp(App).mount('#app')
}
