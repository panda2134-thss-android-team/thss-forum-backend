import Koa from 'koa'
import State from './State'

export type KoaMiddleware = (ctx: Koa.ParameterizedContext<State>, next: () => Promise<any>) => Promise<void>
