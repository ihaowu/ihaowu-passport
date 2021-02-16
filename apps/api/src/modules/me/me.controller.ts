import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request as Req,
  Response as Res,
  HttpStatus,
} from '@nestjs/common'
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { Request, Response } from 'express'

import { LocalAuthGuard } from '../../guards/local.guard'

import { MeService } from './me.service'

@ApiTags('个人资料')
@Controller('/api')
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get('/me')
  @ApiOperation({
    summary: '获取当前用户',
    description: '获取当前用户信息',
  })
  @ApiResponse({ status: 200 })
  @UseGuards(LocalAuthGuard)
  async getMe(@Req() req: Request, @Res() res: Response) {
    const userId = req.user?.userId as string
    const me = await this.meService.getMe(userId)
    res.status(HttpStatus.CREATED).json(me)
  }
}
