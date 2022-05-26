import {ParameterizedContext} from 'koa'
import State from '../middleware/State'
import {BadRequestError} from '../errors/BadRequestError'
import assert from 'assert'

export function parseStartEndDate (ctx: ParameterizedContext<State>): {start?: Date, end?: Date} {
  const {start: startQuery, end: endQuery} = ctx.query
  if (typeof startQuery !== 'string' || typeof endQuery !== 'string') {
    throw new BadRequestError('start / end should be strings')
  }
  let start: Date, end: Date
  try {
    start = new Date(startQuery)
    end = new Date(endQuery)
    assert(!Number.isNaN(+start) && !Number.isNaN(+end))
  } catch (e) {
    throw new BadRequestError('start / end should be RFC3339 date strings')
  }
  return {start, end}
}
