export function asteriskToMobile(mobile?: string): string {
  return typeof mobile === 'string' ? mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : ''
}

export function asteriskToEmail(email?: string): string {
  if (typeof email === 'string' && email.length > 0) {
    const [name, suffix] = email.split('@')
    if (email.length > 4) {
      return `${name.substr(0, 1)}***@${suffix}`
    }
    return `${name.substr(0, 2)}***${name.substr(-2)}@${suffix}`
  }
  return ''
}
