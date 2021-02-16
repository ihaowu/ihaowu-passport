import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { string } from 'joiful'

import { username, password, email } from '../../../lib/joi/decorators'

/**
 * 使用密码创建
 */
export class LoginUserDto {
  @ApiProperty()
  @username.required()
  username!: string

  @ApiProperty()
  @password.required()
  password!: string
}

export class ActiveAccountDto {
  @ApiProperty()
  @email.required()
  email!: string

  @ApiProperty()
  @string().trim().required()
  token!: string

  @ApiPropertyOptional()
  @password
  password?: string
}
