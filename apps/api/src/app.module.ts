import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ClientsModule, Transport, RedisOptions } from '@nestjs/microservices'

import { MailerModule } from '@nestjs-modules/mailer'
import { RedisModule, RedisModuleOptions } from 'nestjs-redis'

import { RavenModule, RavenInterceptor } from 'nest-raven'

import { useConfigLoader } from '@ihaowu/nestjs-utils'

import { AppController } from './app.controller'

import { AuthModule } from './modules/auth/auth.module'
import { MeModule } from './modules/me/me.module'
import { UserModule } from './modules/user/user.module'
import { SharedModule } from './modules/shared/shared.module'

const isProd = process.env.NODE_ENV === 'production'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: useConfigLoader(__dirname),
    }),
    ClientsModule.registerAsync([
      {
        name: 'MICRO_SERVICE',
        useFactory(cfg: ConfigService): RedisOptions {
          return {
            transport: Transport.REDIS,
            options: cfg.get('redis'),
          }
        },
        inject: [ConfigService],
      },
    ]),
    RedisModule.forRootAsync({
      useFactory(cfg: ConfigService) {
        return cfg.get('redis') as RedisModuleOptions
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
    RavenModule,
    AuthModule,
    UserModule,
    MeModule,
    SharedModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor(),
    },
  ],
  controllers: [AppController],
})
export class AppModule {}
