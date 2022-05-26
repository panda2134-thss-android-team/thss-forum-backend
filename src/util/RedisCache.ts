import {createClient} from 'redis'
import configuration from '../configuration'
import logger from './Logger'

export const redisClient = createClient({
  url: configuration.redis.url
})

redisClient.on('error', (e) => {
  logger.error(`Redis error: ${e}`)
})

await redisClient.connect()
logger.info('Redis connected')
