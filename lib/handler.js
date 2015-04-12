export default class Handler {
  constructor(...args) {
    // Support (obj, methodName) for proper binding
    if (typeof args[0] === 'object') {
      this.context = args.shift()
    }

    // Store promiser function
    this.promiser = args[0]

    // Store custom finder and responder, when present
    this.finder = args[1] || this.finder
    this.responder = args[2] || this.responder

    // Make sure (obj, methodName) found the real function
    if (this.context && typeof this.promiser === 'string') {
      this.promiser = this.context[this.promiser]
    }
  }

  finder() {
    return []
  }
}
