export function checkHosts(host: string, allowedHosts: string[]): boolean {
  return allowedHosts.includes(host)
}
