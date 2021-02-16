import type { SignOptions } from 'jsonwebtoken'
import type { ClientOpts as RedisOptions } from 'redis'
import type { SessionOptions } from 'express-session'

export default () => {
  const pkg = require('../../package.json')

  return {
    appInfo: {
      name: pkg.name,
      version: pkg.version,
    },
    allowedHosts: [], // 暂未使用
    jwt: <SignOptions>{
      expiresIn: '30m',
    },
    redis: <RedisOptions>{
      url: process.env.READS_URL,
    },
    oauth: {
      wechat: {
        scope: 'snsapi_userinfo',
      },
      github: {},
    },
    session: <SessionOptions>{
      resave: false,
      saveUninitialized: false,
    },
  }
}
