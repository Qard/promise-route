import {inherits} from 'util'
import Handler from './handler'

export default class ExpressHandler extends Handler {

  responder(task, req, res, next) {
    task().then((data) => {
      // Support streams
      if (data && typeof data.pipe === 'function') {
        data.pipe(res)
        return
      }

      // Or arbitrary data
      res.send(data)
    }).catch(next)
  }

  handler() {
    let self = this
    return function (...inArgs) {
      // Find arguments
      let outArgs = self.finder.apply(this, inArgs)

      // Create bound task from promiser
      let task = self.promiser.bind(self.context || this, ...outArgs)

      // Run responder with bound promiser
      self.responder.call(this, task, ...inArgs)
    }
  }

}
