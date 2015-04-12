import Handler from './handler'
import {inherits} from 'util'

export default class KoaHandler extends Handler {

  *responder(task, next) {
    this.body = yield task()
  }

  handler() {
    let self = this
    return function* (next) {
      let { responder, promiser, finder } = self
      let args

      // Find arguments, making sure to yield for generators
      if (isGeneratorFunction(finder)) {
        args = yield finder.apply(this)
      } else {
        args = finder.apply(this)
      }

      // Create bound task from promiser
      let task = promiser.bind(self.context || this, ...args)

      // Run responder with bound promiser
      let res = responder.call(this, task, next)
      if (isGeneratorFunction(responder)) {
        yield res
      }
    }
  }

}

//
// Helpers
//

function isFunction (fn) {
  return typeof fn === 'function'
}

function isGeneratorFunction (fn) {
  return isFunction(fn) && fn.constructor.name === 'GeneratorFunction'
}
