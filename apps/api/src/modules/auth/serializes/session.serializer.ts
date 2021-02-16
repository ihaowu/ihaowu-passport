import { PassportSerializer } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'

import { User } from '@prisma/client'

import _ from 'lodash'

@Injectable()
export class SessionSerializer extends PassportSerializer {
  async serializeUser(user: User, done: Function) {
    done(null, { userId: user.userId })
  }

  deserializeUser(user: { userId: string }, done: Function) {
    done(null, user)
  }
}
