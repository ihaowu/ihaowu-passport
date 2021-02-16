import { Module } from '@nestjs/common'

import { UserModule } from '../user/user.module'
import { SharedModule } from '../shared/shared.module'

import { MeService } from './me.service'

import { MeController } from './me.controller'
import { MyAccountController } from './account.controller'

@Module({
  imports: [SharedModule, UserModule],
  providers: [MeService],
  exports: [MeService],
  controllers: [MyAccountController, MeController],
})
export class MyModule {}
