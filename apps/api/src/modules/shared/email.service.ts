import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MailerService } from '@nestjs-modules/mailer'

import { Prisma } from '@prisma/client'

import Mustache from 'mustache'

import { PrismaService } from './prisma.service'

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name, true)

  private readonly emailTplRepo: Prisma.EmailTemplateDelegate<unknown>

  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    prismaService: PrismaService,
  ) {
    this.emailTplRepo = prismaService.emailTemplate
  }

  /**
   * 激活邮件
   *
   * @param to 激活人邮箱
   * @param token token
   *
   * @todo 如果失败，重新尝试
   * @todo 需要限制邮件发送频次，防止被拉入黑名单
   */
  async sendActiveMail(to: string, token: string, meta?: object) {
    const configService = this.configService
    const appName = configService.get('APP_NAME')
    const appHost = configService.get('APP_HOST')

    const result = await this.emailTplRepo.findFirst({
      where: { scene: 'active_account', enabled: true },
    })
    if (result) {
      try {
        const html = Mustache.render(result.content, { appName, appHost, to, token, ...meta })
        await this.mailerService.sendMail({ to, subject: `${appName}帐号激活`, html })
      } catch (err) {
        this.logger.error(`邮件发生失败: ${err.message}`, 'EmailService#sendActiveMail')
      }
    } else {
      this.logger.error('邮件激活模板不存在', 'EmailService#sendActiveMail')
    }
  }
}
