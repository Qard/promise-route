# krisp-route-builder

### Usage

Consider a promise returning function such as this:

```js
function delay (n) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(n.toString())
    }, n)
  })
}
```

##### koa

```js
app.get('/delay/:delay', build.koa(delay, function* () {
  return [this.params.delay]
}, function* (run, next) {
  this.body = yield run()
}))
```

##### express

```js
app.get('/delay/:delay', build.express(delay, function (req) {
  return [req.params.delay]
}, function (run, req, res, next) {
  run().then(function (data) {
    res.send(data)
  })
}))
```
