// TODO: tell @starrah to fix this
//@ts-ignore
import mongoose from '@starrah/mongo-ts-struct/node_modules/mongoose/index.js'
import logger from '../util/Logger'

export async function connectToDatabase(uri: string = 'mongodb://127.0.0.1:27017/thss-forum') {
  logger.info(`Connecting to database: ${uri}`)
  mongoose.pluralize(null)
  await mongoose.connect(uri, {
    connectTimeoutMS: 3000,
    useUnifiedTopology: true,
    useNewUrlParser: true
  })
}
