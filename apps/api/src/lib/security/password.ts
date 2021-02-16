import { hash, compare, genSalt } from 'bcrypt'

export function comparePasswd(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword)
}

export async function hashPasswd(password: string): Promise<string> {
  return hash(password, await genSalt(10))
}
