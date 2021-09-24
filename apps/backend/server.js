const express = require('express')

const state = {}

const app = express()
// middleware
app.use(express.json())
// insert
app.put('/api/state/:key', (req, res) => {
  state[req.params.key] = req.body.value
  res.status(204)
  res.end()
})
// get
app.get('/api/state/:key', (req, res) => {
  const value = state[req.params.key] || null
  res.send({
    value
  })
})
// static assets
app.use('/', express.static('./node_modules/frontend/'))
// bind + listen
app.listen(3000, () => console.log('Listening...'))