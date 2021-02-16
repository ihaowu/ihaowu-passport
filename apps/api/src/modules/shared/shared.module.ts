import { Module } from '@nestjs/common'

import { PrismaService } from './prisma.service'
import { EmailService } from './email.service'

@Module({
  providers: [PrismaService, EmailService],
  exports: [PrismaService, EmailService],
})
export class SharedModule {}
