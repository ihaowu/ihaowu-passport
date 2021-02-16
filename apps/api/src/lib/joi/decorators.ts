import { string } from 'joiful'

import { USERNAME_RE, MOBILE_RE, CODE_RE, PASSWD_RE } from './patterns'

export const username = string().lowercase().trim().pattern(USERNAME_RE)

export const mobile = string().trim().pattern(MOBILE_RE)

export const password = string().trim().pattern(PASSWD_RE)

export const email = string().email().trim()

export const code = string().trim().pattern(CODE_RE)
