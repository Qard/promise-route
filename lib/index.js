/**
 * NOTE: Handler classes are lazy-loaded to prevent koa generators
 * from blowing up environments that do not support generators.
 */

export function koa (a, b, c) {
  let KoaHandler = require('./koa')
  let handle = new KoaHandler(a, b, c)
  return handle.handler()
}

export function express (a, b, c) {
  let ExpressHandler = require('./express')
  let handle = new ExpressHandler(a, b, c)
  return handle.handler()
}
