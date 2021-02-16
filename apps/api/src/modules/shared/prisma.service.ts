import { Injectable, OnModuleInit, OnModuleDestroy, Scope } from '@nestjs/common'

import { PrismaClient } from '@prisma/client'

@Injectable({ scope: Scope.DEFAULT })
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  onModuleInit() {
    return this.$connect()
  }

  onModuleDestroy() {
    return this.$disconnect()
  }
}
