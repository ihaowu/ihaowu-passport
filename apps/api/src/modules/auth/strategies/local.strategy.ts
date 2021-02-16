import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'

import { Strategy } from 'passport-local'

import { User } from '@prisma/client'

import { comparePasswd } from '../../../lib/security/password'

import { AuthService } from '../../auth/auth.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super()
  }

  async validate(username: string, password: string): Promise<User> {
    return this.authService.validateUser(username, password)
  }
}
