import {
  Injectable,
  Logger,
} from '@nestjs/common'

import { Prisma } from '@prisma/client'

import type { Me } from '@ihaowu-password/api-interfaces/user'

import _ from 'lodash'

import { asteriskToMobile, asteriskToEmail } from '../../lib/security/asterisk'

import { UserService } from '../user/user.service'
import { PrismaService } from '../shared/prisma.service'

@Injectable()
export class MeService {
  private readonly userRepo: Prisma.UserDelegate<unknown>
  private readonly logger = new Logger(MeService.name, true)

  constructor(
    private readonly userService: UserService,
    prismaService: PrismaService,
  ) {
    this.userRepo = prismaService.user
  }

  /**
   * 获取当前用户信息
   *
   * @param user
   */
  async getMe(userId: string): Promise<Me | void> {
    const user = await this.userService.getUser(userId, { mobile: true, email: true }) as Me

    // 添加 * 号
    user.mobile = asteriskToMobile(user.mobile)
    user.email = asteriskToEmail(user.email)

    return user
  }
}
