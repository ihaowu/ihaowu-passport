import { Injectable } from '@nestjs/common'

import type { Me } from '@ihaowu-password/api-interfaces/user'

import { asteriskToMobile, asteriskToEmail } from '../../lib/security/asterisk'

import { UserService } from '../user/user.service'

@Injectable()
export class MeService {
  constructor(private readonly userService: UserService) {}

  /**
   * 获取当前用户信息
   *
   * @param user
   */
  async getMe(userId: string): Promise<Me> {
    const user = (await this.userService.getUser(userId, { mobile: true, email: true })) as Me

    // 添加 * 号
    user.mobile = asteriskToMobile(user.mobile)
    user.email = asteriskToEmail(user.email)

    return user
  }
}
