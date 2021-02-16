import { Prisma } from '@prisma/client'
import { Injectable, BadRequestException, ConflictException } from '@nestjs/common'

import type { Friends } from '@ihaowu-password/api-interfaces/user'

import { AuthService } from '../auth/auth.service'

import { PrismaService } from '../shared/prisma.service'

@Injectable()
export class UserService {
  private readonly userRepo: Prisma.UserDelegate<unknown>

  constructor(private readonly authService: AuthService, prismaService: PrismaService) {
    this.userRepo = prismaService.user
  }

  /**
   * 重新发送激活邮件
   *
   * @param userId 用户 ID
   *
   * @todo 类型定义需要优化
   */
  async getUser<U extends Friends = Friends>(
    userId: string,
    userSelect?: Prisma.UserSelect,
  ): Promise<U> {
    const defaultsSelect = {
      userId: true,
      username: true,
      avatar: true,
      nickname: true,
      gender: true,
      isAdmin: true,
      verified: true,
      mobileVerified: true,
      emailVerified: true,
      createdAt: true,
    }
    const user = await this.userRepo.findFirst({
      select: {
        ...defaultsSelect,
        ...userSelect,
        isLocked: true,
        reason: true,
      },
      where: { userId },
    })
    if (user) {
      if (user.isLocked) {
        throw new BadRequestException(`用户已冻结：${user.reason}`)
      }
      return (user as unknown) as U
    } else {
      throw new BadRequestException('用户不存在或已注销')
    }
  }

  /**
   * 重新发送激活邮件
   *
   * @param userId 用户 ID
   */
  async sendActiveEmail(userId: string) {
    const user = await this.userRepo.findFirst({ where: { userId } })
    if (user && user.email) {
      if (user.emailVerified) {
        throw new ConflictException('邮箱已激活，无需再次激活')
      }
      await this.authService.sendActiveMail(user.email)
    } else {
      throw new BadRequestException('用户邮箱不存在')
    }
  }
}
