import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { SharedModule } from '../shared/shared.module'

import { JwtStrategy } from './strategies/jwt.strategy'
import { LocalStrategy } from './strategies/local.strategy'

import { SessionSerializer } from './serializes/session.serializer'

import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'

@Module({
  imports: [
    PassportModule.register({
      session: true,
      defaultStrategy: 'jwt',
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: configService.get('jwt'),
        }
      },
    }),
    SharedModule,
  ],
  providers: [JwtStrategy, LocalStrategy, SessionSerializer, AuthService],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
