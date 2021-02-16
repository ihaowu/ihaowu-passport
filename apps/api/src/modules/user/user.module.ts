import { Module } from '@nestjs/common'

import { AuthModule } from '../auth/auth.module'
import { SharedModule } from '../shared/shared.module'

import { UserService } from '../user/user.service'

@Module({
  imports: [AuthModule, SharedModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
