import supertest from 'supertest'
import Promise from 'bluebird'
import http from 'http'

// Patch promise support onto supertest
supertest.Test.prototype.promise = function () {
  return new Promise((yay, boo) => {
    this.end((err, res) => err ? boo(err) : yay(res))
  })
}
supertest.Test.prototype.then = function (...args) {
  return this.promise().then(...args)
}

let fixtures = {
  delay(n) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(n.toString()), n)
    })
  },
  stream(s) {
    return Promise.resolve(s)
  },
  fail() {
    return Promise.reject('nope')
  }
}

let finders = {
  koa: {
    delay() {
      return [this.query.delay]
    },
    stream() {
      return [this.req]
    }
  },
  express: {
    delay(req, res) {
      return [req.query.delay]
    },
    stream(req, res) {
      return [req]
    }
  }
}

let frameworks = [
  'express',
  'koa'
]

frameworks.forEach((name) => {
  describe(name, () => {
    let fw = require(name)
    let request
    let server
    let port
    let app

    let handler = require('../')[name]
    let keys = Object.keys(fixtures)
    let fwFinders = finders[name]

    before(() => {
      app = fw()

      // Koa needs a router and error handler attached
      if (name === 'koa') {
        app.use(function* (next) {
          try {
            yield* next
          } catch (e) {
            this.status = 500
            this.body = e
          }
        })
        app.use(require('koa-router')(app))
      }

      // Mount handlers
      keys.forEach((key) => {
        let route = handler(fixtures, key, fwFinders[key])
        app.post('/' + key, route)
      })

      // Silence express errors by providing an error handler
      if (name === 'express') {
        app.use((err, req, res, next) => {
          res.status(500).send(err.message || err)
        })
      }

      // Create requestor
      request = supertest(name === 'koa' ? app.callback() : app)
    })

    it('should delay', () => {
      let query = { delay: 100 }
      return request.post('/delay')
        .query(query)
        .then((res) => {
          res.text.should.equal(query.delay.toString())
        })
    })

    it('should stream', () => {
      return request.post('/stream')
        .send('hello, world')
        .then((res) => {
          res.text.should.equal('hello, world')
        })
    })

    it('should fail elegantly', () => {
      return request.post('/fail')
        .then((res) => {
          res.statusCode.should.equal(500)
          res.text.should.equal('nope')
        })
    })
  })
})
