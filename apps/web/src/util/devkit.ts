import { ComponentPublicInstance } from 'vue'

import { runApp } from '@/pages/failure/main'

const preTasks: Promise<unknown>[] = []

// if (import.meta.env.DEV) {
//   async function loadMockFilesSync() {
//     const modules = await import.meta.glob('../mocks/**/*.mock.ts')

//     const files = Object.keys(modules)
//     if (files.length > 0) {
//       console.log(`[devkit] Load files: ${files.join('')}`)
//     } else {
//       console.warn('[devkit] Cannot find `*.mock.ts` files.')
//     }
//   }

//   preTasks.push(loadMockFilesSync())
// }

/**
 * 处理 Vue 组件错误
 *
 * @param err
 * @param instance
 * @param info
 */
export function handleVueError(
  err: unknown,
  instance: ComponentPublicInstance | null,
  info: string,
): void {
  // pass
}

export function handleAppError(error: unknown) {
  return runApp()
}

function setup() {
  return Promise.all(preTasks)
}

export default {
  setup,
}
