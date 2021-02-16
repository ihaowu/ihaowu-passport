import {
  Controller,
  Get,
  Request as Req,
  Response as Res
} from '@nestjs/common'
import { ApiResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { Request, Response } from 'express'

import type { Environment } from '@ihaowu-password/api-interfaces/environment'

import { MeService } from './modules/me/me.service'

@ApiTags('通用')
@Controller()
export class AppController {
  constructor(private readonly meService: MeService){}

  @Get('/app/environment.*')
  @ApiOperation({
    summary: '环境变脸',
    description: '用于非服务端渲染的应用，支持返回 js 和 json 数据',
  })
  @ApiResponse({ status: 200 })
  async environmentJS(@Req() req: Request, @Res() res: Response) {
    const data: Environment = { isLogin: false }
    const userId = req.user?.userId
    if (userId) {
      data.user = await this.meService.getMe(userId)
    }

    const path = req.path
    switch (true) {
      case path.endsWith('.esm.js'):
        res.type('application/javascript').end(createESM(data))
        break
      case path.endsWith('.js'):
        res.type('application/javascript').end(createUMD(data))
        break
      default:
        res.json(data)
    }
  }
}

function createUMD(content: object): string {
  return `(function(root,factory){if(typeof define==='function'&&define.amd){define([],factory)}else if(typeof exports==='object'){module.exports=factory()}else{root.AppEnv=factory()}}(this,function(){return ${JSON.stringify(content)};}));`
}

function createESM(content: object): string {
  return `export default ${JSON.stringify(content)}`
}
