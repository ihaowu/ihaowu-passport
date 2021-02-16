import type { SessionOptions } from 'express-session'

export default () => ({
  proxy: 1,
  session: <SessionOptions>{
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  },
})
