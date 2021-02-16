// import { ComponentPublicInstance } from 'vue'

import * as Sentry from '@sentry/browser'
import { Integrations } from '@sentry/tracing'

/**
 * 处理 Vue 组件错误
 *
 * @param err
 * @param instance
 * @param info
 *
 * @todo sentry 还不支持 vue3
 */
export function handleVueError(
  err: unknown,
  // instance: ComponentPublicInstance | null,
  // info: string,
): void {
  Sentry.captureException(err)
}

function setup() {
  // 拦截 http 请求
  if (import.meta.env.DEV) {
    const modules = import.meta.globEager('../mocks/**/*.mock.ts')

    const files = Object.keys(modules)
    if (files.length > 0) {
      console.log(`[devkit] Load files: ${files.join('')}`)
    } else {
      console.warn('[devkit] Cannot find `*.mock.ts` files.')
    }
  }

  // 启用 Sentry
  Sentry.init({
    enabled: import.meta.env.PROD && !!import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.PROD ? 'production' : 'development',
    dsn: import.meta.env.VITE_SENTRY_DSN as string,
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 1.0,
  })
  window.addEventListener('error', (event) => {
    Sentry.captureException(event)
  })
  window.addEventListener('unhandledrejection', (event) => {
    Sentry.captureException(event)
  })
}

export default {
  setup,
}
