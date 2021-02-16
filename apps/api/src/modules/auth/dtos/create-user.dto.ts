import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { joi } from 'joiful'
import { getJoiSchema } from 'joiful/core'

import { username, password, mobile, email, code } from '../../../lib/joi/decorators'

/**
 * 使用密码创建
 */
export class CreateUserDto {
  @ApiProperty({
    description: '用户名',
  })
  @username.optional()
  username!: string

  @ApiProperty({
    description: '密码',
  })
  @password.optional()
  password!: string

  @ApiPropertyOptional({
    description: '邮箱，和手机号互逆',
  })
  @email.optional()
  email!: string

  @ApiPropertyOptional({
    description: '手机号，和邮箱互逆',
  })
  @mobile
  mobile!: string

  @ApiPropertyOptional({
    description: '短信验证码，仅手机号注册时需要',
  })
  @code.optional()
  code!: string
}

export default getJoiSchema(CreateUserDto, joi)
  ?.or('mobile', 'email')
  .with('email', 'password')
  .with('mobile', 'code')
