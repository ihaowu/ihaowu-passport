import { USERNAME_RE, PASSWD_RE } from './joi/patterns'

/**
 * 合并 URLSearchParams 对象内容
 *
 * @param target 目标
 * @param other  其他
 */
export function combineURLSearchParams(
  target: URLSearchParams,
  other: URLSearchParams | [string, string][],
): URLSearchParams {
  for (const [key, value] of other) {
    target.set(key, value)
  }
  return target
}

export function isUsername(value: string): boolean {
  return typeof value === 'string' && USERNAME_RE.test(value)
}

export function isPassword(value: string): boolean {
  return typeof value === 'string' && PASSWD_RE.test(value)
}
