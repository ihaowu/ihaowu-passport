import type { SessionOptions } from 'express-session'

export default () => {
  return {
    session: <SessionOptions>{
      resave: false,
      saveUninitialized: false,
      secret: 'RWk54BsNSIth2aXe',
    },
  }
}
