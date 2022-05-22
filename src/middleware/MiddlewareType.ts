import Koa from 'koa'
import State from './State'

export type KoaMiddleware = (ctx: Koa.ParameterizedContext<State>, next: () => Promise<any>) => Promise<void>
export type KoaMiddlewareWithBody<T> = (ctx: Koa.ParameterizedContext<State>, next: () => Promise<any>, bodyTyped: T) => Promise<void>
