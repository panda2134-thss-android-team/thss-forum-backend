import logger from './util/Logger'
import dotenv from 'dotenv'

dotenv.config()

if (! process.env.JWT_SECRET) {
  logger.error('JWT secret is empty')
  process.exit(1)
}

export default {
  jwt: {
    secret: process.env['JWT_SECRET'],
    expireSeconds: 7 * 24 * 3600
  },
  redis: {
    url: process.env.REDIS_URL
  },
  mongo: {
    url: process.env.MONGODB_URL
  },
  ws: {
    loginTimeout: parseInt(process.env.WS_LOGIN_TIMEOUT ?? '10000') // 10000ms
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
