import {
  Controller,
  Post,
  UseGuards,
  Request as Req,
  Response as Res,
  HttpStatus,
} from '@nestjs/common'
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { Request, Response } from 'express'

import { LocalAuthGuard } from '../../guards/local.guard'

import { UserService } from '../user/user.service'

@ApiTags('我的账号')
@Controller('/api/myaccount')
export class MyAccountController {
  constructor(private readonly userService: UserService) {}

  @Post('/send_active_email')
  @ApiOperation({
    summary: '发送激活邮件',
    description: '激活邮件',
  })
  @ApiResponse({ status: 200 })
  @UseGuards(LocalAuthGuard)
  async sendActiveEmail(@Req() req: Request, @Res() res: Response) {
    const userId = req.user?.userId as string
    await this.userService.sendActiveEmail(userId)
    res.status(HttpStatus.CREATED).end()
  }
}
