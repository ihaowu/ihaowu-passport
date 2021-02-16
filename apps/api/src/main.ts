import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { NestExpressApplication } from '@nestjs/platform-express'

import { RedisService } from 'nestjs-redis'

import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import session, { SessionOptions } from 'express-session'
import createRedisStore from 'connect-redis'
import passport from 'passport'

import { AppModule } from './app.module'

const RedisStore = createRedisStore(session)

function showBanner(url: string) {
  const banner = `
App running at:
- HTTP:       ${url}
- Swagger UI: ${url}/doc
`
  console.log(banner)
}

export async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: false,
  })
  const config = app.get(ConfigService)

  // 如果是 cookie 安全或启用反向代理，如：nginx
  const proxy = config.get('proxy')
  if (proxy || config.get('session.Cookie.secure')) {
    // 信任第一个代理
    app.set('trust proxy', proxy || 1)
  }

  app.use(helmet())
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }))

  const redisService = app.get(RedisService)
  const store = new RedisStore({ client: redisService.getClient() })

  // 必须使用浅拷贝，否则会报错
  const sessOpts = config.get('session') as SessionOptions
  app.use(session({ ...sessOpts, store }))

  app.use(passport.initialize())
  app.use(passport.session())

  // 开发模式下才生成文档
  if (process.env.NODE_ENV === 'development') {
    const pkg = require('../package.json')
    const { DocumentBuilder, SwaggerModule } = require('@nestjs/swagger')
    const options = new DocumentBuilder()
      .setTitle(pkg.name)
      .setVersion(pkg.version)
      .setDescription(pkg.description)
      .addBearerAuth()
      .build()
    const apiDocument = SwaggerModule.createDocument(app, options)
    SwaggerModule.setup('/doc', app, apiDocument)
  }

  await app.listen(config.get<number>('PORT', 7100), config.get<string>('HOST', '0.0.0.0'))

  if (process.env.NODE_ENV === 'development') {
    showBanner(await app.getUrl())
  }
}

if (require.main === module) {
  bootstrap()
}
