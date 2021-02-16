import { Me } from './user'

export interface Environment {
  isLogin: boolean
  user?: Me
}
