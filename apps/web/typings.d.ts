import type { Environment } from '@ihaowu-password/api-interfaces/environment'

declare global {
  /**
   * 应用环境变量
   */
  var AppEnv: Environment
}

declare module '*.vue' {
  import { defineComponent } from 'vue'
  const Component: ReturnType<typeof defineComponent>
  export default Component
}
