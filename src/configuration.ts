import logger from './util/Logger'

if (! process.env.JWT_SECRET) {
  logger.error('JWT secret is empty')
  process.exit(1)
}

export default {
  jwt: {
    secret: process.env['JWT_SECRET'],
    expireSeconds: 7 * 24 * 3600
  },
  mongo: {
    url: process.env.MONGODB_URL
  },
  alicloud: {
    accessKey: {
      id: process.env.ALIYUN_AK_ID,
      secret: process.env.ALIYUN_AK_SECRET
    },
    sts: {
      endpoint: process.env.ALIYUN_STS_ENDPOINT,
      roleARN: process.env.ALIYUN_STS_ROLE_ARN
    }
  }
}
