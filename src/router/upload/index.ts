import Router, {Middleware} from '@koa/router'
import assert from 'assert'
import configuration from '../../configuration'
import AuthMiddleware from '../../middleware/AuthMiddleware'
import State from '../../middleware/State'
import {OSSService} from '../../service/OSSService'

const ossService = new OSSService({
  accessKeyId: configuration.alicloud.accessKey.id,
  accessKeySecret: configuration.alicloud.accessKey.secret,
  stsEndpoint: configuration.alicloud.sts.endpoint,
  roleARN: configuration.alicloud.sts.roleARN
})
const uploadRouter = new Router<State>()
const authMiddleware = AuthMiddleware(configuration.jwt.secret, configuration.jwt.expireSeconds)
uploadRouter.use(authMiddleware)


const getToken: Middleware<State> = async (ctx) => {
  assert(ctx.state.user)
  ctx.body = await ossService.requestSTSToken(ctx.state.user)
}


uploadRouter.post('/token', getToken)

export default uploadRouter
