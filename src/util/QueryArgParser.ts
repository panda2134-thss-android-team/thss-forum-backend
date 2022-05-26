import {ParameterizedContext} from 'koa'
import State from '../middleware/State'
import {BadRequestError} from '../errors/BadRequestError'
import assert from 'assert'

export function parseStartEndDate (ctx: ParameterizedContext<State>): {start?: Date, end?: Date} {
  const {start: startQuery, end: endQuery} = ctx.query
  if ((startQuery != null && typeof startQuery !== 'string') || (endQuery && typeof endQuery !== 'string')) {
    throw new BadRequestError('start / end should be strings')
  }
  if (Array.isArray(startQuery) || Array.isArray(endQuery)) {
    throw new BadRequestError('start / end should only appear once in query string')
  }
  let start: Date | undefined, end: Date | undefined
  try {
    if (startQuery) {
      start = new Date(startQuery)
      assert(!Number.isNaN(+start))
    }
    if (endQuery) {
      end = new Date(endQuery)
      assert(!Number.isNaN(+end))
    }
  } catch (e) {
    throw new BadRequestError('start / end should be RFC3339 date strings')
  }
  return {start, end}
}
