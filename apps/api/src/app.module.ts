import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ClientsModule, Transport, RedisOptions } from '@nestjs/microservices'

import { MailerModule } from '@nestjs-modules/mailer'
import { RedisModule, RedisModuleOptions } from 'nestjs-redis'

import { useConfigLoader } from '@ihaowu/nestjs-utils'

import { AuthModule } from './modules/auth/auth.module'
import { MyModule } from './modules/my/my.module'
import { UserModule } from './modules/user/user.module'
import { SharedModule } from './modules/shared/shared.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: useConfigLoader(__dirname),
    }),
    ClientsModule.registerAsync([
      {
        name: 'MICRO_SERVICE',
        useFactory(configService: ConfigService): RedisOptions {
          return {
            transport: Transport.REDIS,
            options: configService.get('redis'),
          }
        },
        inject: [ConfigService],
      },
    ]),
    RedisModule.forRootAsync({
      useFactory(configService: ConfigService) {
        return configService.get('redis') as RedisModuleOptions
      },
      inject: [ConfigService],
    }),
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const user = configService.get('EMAILER_USER')
        const defaultForm = configService.get('EMAILER_DEFAULT_EMAIL') || user
        return {
          transport: {
            host: configService.get('EMAILER_HOST'),
            port: configService.get('EMAILER_PORT'),
            secure: configService.get('EMAILER_SECURE') !== 'False',
            auth: { user, pass: configService.get('EMAILER_PASS') },
          },
          defaults: {
            from: `"${configService.get('APP_NAME', 'noreply')}" <${defaultForm}>`,
          },
        }
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    MyModule,
    SharedModule,
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}