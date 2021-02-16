import {
  Injectable,
  Scope,
  Logger,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common'
import { JwtService, JwtSignOptions } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

import { RedisService } from 'nestjs-redis'

import { Prisma, User } from '@prisma/client'

import { Redis } from 'ioredis'

import { hash } from '@ihaowu/nestjs-utils'

import { isUsername } from '../../lib/util'
import { comparePasswd, hashPasswd } from '../../lib/security/password'

import { EmailService } from '../shared/email.service'
import { PrismaService } from '../shared/prisma.service'

import { CreateUserDto } from './dtos/create-user.dto'
import { LoginUserDto, ActiveAccountDto } from './dtos/login-user.dto'

@Injectable()
export class AuthService {
  private readonly secret: string

  private readonly userRepo: Prisma.UserDelegate<unknown>
  private readonly userLogRepo: Prisma.UserLogDelegate<unknown>

  private readonly redisClient: Redis

  private readonly logger = new Logger(AuthService.name, true)

  constructor(
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    configService: ConfigService,
    redisService: RedisService,
    prismaService: PrismaService,
  ) {
    this.secret = configService.get('session.secret') as string
    this.redisClient = redisService.getClient()

    this.userLogRepo = prismaService.userLog
    this.userRepo = prismaService.user
  }

  /**
   * 生成 jwt 数据
   *
   * @param userId   授权用户ID
   * @param options  可选参数
   *
   * @return jwt
   */
  async genSignToken(userId: string, options?: JwtSignOptions): Promise<string> {
    return this.jwtService.signAsync({ userId }, options)
  }

  /**
   * 创建用户
   *
   * @todo 缺少注册来源，操作日志需要记录
   *
   * @param formData 表单数据
   */
  async createUser(formData: CreateUserDto): Promise<User> {
    const { username, mobile, email, code, password } = formData
    const filters: Prisma.UserWhereInput[] = []

    const hasUsername = !!username
    if (hasUsername) {
      filters.push({ username: username })
    }

    const hasMobile = !!mobile
    if (hasMobile) {
      /**
       * @todo 校验验证码
       */
      filters.push({ mobile: mobile })
    }

    const hasEmail = !!email
    if (hasEmail) {
      filters.push({ email: email })
    }

    const result = await this.userRepo.findFirst({ where: { OR: filters } })
    if (result) {
      let message: string
      if (hasUsername && username === result.username) {
        message = '用户名已存在'
      } else if (hasMobile && mobile === result.mobile) {
        message = '手机号已存在'
      } else {
        message = '邮箱已存在'
      }
      throw new ConflictException(message)
    }

    // 密码加密
    const userData: Prisma.UserCreateInput = { username, mobile, email, isAdmin: false }
    if (password) {
      userData.verified = hasUsername
      userData.password = await hashPasswd(password)
    }

    return this.userRepo.create({ data: userData })
  }

  /**
   * 发送激活邮件
   *
   * @param email 接收邮件地址
   */
  sendActiveMail(email: string) {
    const token = hash('md5', email + this.secret)
    return this.emailService.sendActiveMail(email, token)
  }

  /**
   * 激活账号
   *
   * @param email
   * @param token
   */
  async activeAccount(payload: ActiveAccountDto): Promise<User> {
    const { token, email } = payload
    if (token !== hash('md5', email + this.secret)) {
      throw new BadRequestException('token invalid')
    }

    const userRepo = this.userRepo
    const user = await userRepo.findFirst({ where: { email } })
    if (!user) {
      throw new NotFoundException('用户不存在')
    }

    if (user.emailVerified) {
      return user
    }

    const data: Prisma.UserUpdateInput = { emailVerified: true }

    // 密码是可选的，如果存在就添加
    if (payload.password) {
      data.verified = true
      data.password = await hashPasswd(payload.password)
    }

    return userRepo.update({
      where: { id: user.id },
      data: data,
    })
  }

  /**
   * 账号密码登录
   *
   * @todo 缺少登录来源，操作日志需要记录
   *
   * @param formData 表单数据
   * @param clientIp  客户端IP
   * @param userAgent 用户代理
   */
  async login(formData: LoginUserDto, clientIp: string, userAgent: string): Promise<User> {
    const { username, password } = formData
    const [retryCount, ttl] = await Promise.all([
      this.getLoginRetryCount(username),
      this.getLoginRetryTTL(username),
    ])
    if (retryCount > 2 && ttl > 0) {
      throw new UnauthorizedException(`密码错误次数过多，请 ${ttl}s 后再试`)
    }

    const insertLoginLog = async (
      user: User,
      payload: Omit<Prisma.UserLogCreateInput, 'User' | 'userAgent' | 'clientIp'>,
    ) => {
      try {
        await this.userLogRepo.create({
          data: {
            ...payload,
            userAgent: userAgent,
            clientIp: clientIp,
            User: { connect: { userId: user.userId } },
          },
        })
      } catch (err) {
        this.logger.error(`用户日志记录失败: ${err.message}`)
      }
    }

    const user = await this.findUser(username)
    if (user.password) {
      if (await comparePasswd(password, user.password as string)) {
        await Promise.all([
          insertLoginLog(user, {
            level: 'info',
            action: 'auth.login.success',
            message: '登录成功',
          }),
          // 清空重试次数
          this.setLoginRetryCount(username, 0, user),
        ])
        return user
      }

      await Promise.all([
        insertLoginLog(user, {
          level: 'warn',
          action: 'auth.login.fail',
          message: '登录失败',
        }),
        this.setLoginRetryCount(username, retryCount + 1, user),
      ])
    }

    throw new UnauthorizedException('账号密码错误')
  }

  /**
   * 获取登录重试次数
   *
   * @param account 当前的登录账户
   *
   * @return 重试次数
   */
  async getLoginRetryCount(account: string): Promise<number> {
    const retryKey = `auth.login.retry:${account}`
    const value = await this.redisClient.get(retryKey)
    return value === null ? 0 : parseInt(value, 10)
  }

  /**
   * 获取登录重试失效时间
   *
   * @param account  当前的登录账户
   * @param count    错误次数
   * @param user     当前用户
   *
   * @return 登录重试失效时间
   */
  async getLoginRetryTTL(account: string): Promise<number> {
    return this.redisClient.ttl(`auth.login.retry:${account}:expire`)
  }

  /**
   * 设置登录重试次数
   *
   * @param account  当前的登录账户
   * @param count    错误次数
   * @param user     当前用户
   */
  async setLoginRetryCount(account: string, count: number, user: User): Promise<void> {
    const redisClient = this.redisClient
    const retryKey = `auth.login.retry:${account}`
    if (count === 0) {
      return void (await Promise.all([
        redisClient.del(retryKey),
        redisClient.del(`${retryKey}:expire`),
      ]))
    }

    if (count > 5) {
      await Promise.all([redisClient.del(retryKey), redisClient.del(`${retryKey}:expire`)])
      await this.userRepo.update({
        data: { isLocked: true, reason: '密码错误次数过多' },
        where: { userId: user.userId },
      })
      throw new UnauthorizedException('你的账号已锁定，请重置密码')
    } else if (count === 4) {
      await Promise.all([
        redisClient.set(retryKey, count, 'ex', 86400),
        redisClient.set(`${retryKey}:expire`, count, 'ex', 420),
      ])
      throw new UnauthorizedException('密码错误，还可尝试1次，失败后将锁定账号')
    } else if (count === 3) {
      await Promise.all([
        redisClient.set(retryKey, count, 'ex', 86400),
        redisClient.set(`${retryKey}:expire`, count, 'ex', 60),
      ])
      throw new UnauthorizedException(`密码错误，还可尝试2次，失败将锁定1分钟`)
    }

    await redisClient.set(retryKey, count, 'ex', 86400)
    throw new UnauthorizedException('用户名或密码错误')
  }

  /**
   * 验证用户信息，strategies/local.strategy.ts 使用
   *
   * @param username 用户名
   */
  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.findUser(username)
    if (user.password) {
      if (await comparePasswd(password, user.password as string)) {
        return user
      }
    }

    /**
     * @todo 记录失败的登录次数，防止暴力破解
     */
    throw new UnauthorizedException('用户名或密码错误')
  }

  /**
   * 获取用户
   *
   * @param username 用户名
   */
  async findUser(username: string) {
    const where: Prisma.UserWhereUniqueInput = {}
    /**
     * @todo 判断失败的登录次数，超过次数禁止登录
     */
    if (isUsername(username)) {
      where.username = username
    } else {
      where.email = username
    }

    const user = await this.userRepo.findUnique({ where: where })
    if (user) {
      if (user.isLocked) {
        throw new UnauthorizedException(`此账号已被冻结: ${user.reason}`)
      }
      return user
    }

    throw new NotFoundException('用户不存在或已注销')
  }
}
