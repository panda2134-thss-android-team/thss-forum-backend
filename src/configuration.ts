import logger from './util/Logger'

if (! process.env.JWT_SECRET) {
  logger.error('JWT secret is empty')
  process.exit(1)
}

export default {
  jwt: {
    secret: process.env['JWT_SECRET'],
    expireSeconds: 7 * 24 * 3600
  }
}
