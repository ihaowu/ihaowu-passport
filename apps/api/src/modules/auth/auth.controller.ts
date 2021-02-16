import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request as Req,
  Response as Res,
  HttpStatus,
} from '@nestjs/common'
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { Request, Response } from 'express'

import { JoiValidationPipe } from '../../pips/joi.pipe'
import { LocalAuthGuard } from '../../guards/local.guard'

import { AuthService } from './auth.service'
import { LoginUserDto, ActiveAccountDto } from './dtos/login-user.dto'
import CreateUserSchema, { CreateUserDto } from './dtos/create-user.dto'

@ApiTags('授权认证')
@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/session')
  @ApiOperation({
    summary: '检查会话',
    description: '如果登录未失效，返回 token',
  })
  @ApiResponse({ status: 200 })
  @UseGuards(LocalAuthGuard)
  async checkSession(@Req() req: Request): Promise<string> {
    return 'success'
  }

  @Post('/login')
  @ApiOperation({
    summary: '账号登录',
    description: '支持用户名或邮箱，使用密码登录',
  })
  @ApiResponse({ status: 200 })
  async login(
    @Req() req: Request,
    @Res() res: Response,
    @Body(JoiValidationPipe) payload: LoginUserDto,
  ) {
    const clientIp = req.ip
    const userAgent = req.get('user-agent') || 'no user-agent'
    const user = await this.authService.login(payload, clientIp, userAgent)

    req.logIn(user, () => void 0)
    res.status(HttpStatus.CREATED).end()
  }

  @Post('/register')
  @ApiOperation({
    summary: '注册',
    description: '支持用户名或邮箱注册',
  })
  @ApiResponse({ status: 200 })
  async register(
    @Req() req: Request,
    @Res() res: Response,
    @Body(new JoiValidationPipe(CreateUserSchema)) payload: CreateUserDto,
  ) {
    const authService = this.authService
    const user = await authService.createUser(payload)

    // 如果包含邮箱就发送激活邮件
    if (user.email) {
      await authService.sendActiveMail(user.email)
    }

    req.logIn(user, () => void 0)
    res.status(HttpStatus.CREATED).end()
  }

  @Post('/active_account')
  @ApiOperation({
    summary: '激活账号',
    description: '仅支持使用邮箱注册的账号',
  })
  @ApiResponse({ status: 200 })
  async activeAccount(
    @Req() req: Request,
    @Res() res: Response,
    @Body(JoiValidationPipe) payload: ActiveAccountDto,
  ) {
    const user = await this.authService.activeAccount(payload)

    req.logIn(user, () => void 0)
    res.status(HttpStatus.OK).end()
  }
}
