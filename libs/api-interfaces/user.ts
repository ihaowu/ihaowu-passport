export interface Friends {
  userId: string
  username: string | null
  avatar: string | null
  nickname: string | null
  gender: number
  createdAt: Date
  isAdmin: boolean
  isLocked: boolean
  reason: string
}

export interface Me extends Friends {
  mobile: string
  email: string
  // emailExpireAt: true
  // mobileExpireAt: true
  // passwordExpireAt: true
  // securityQuestion: true
}
