const express = require('express')

const state = {}

const app = express()
// middleware
app.use(express.json())
// static
app.get('/', express.static('./'))
// insert
app.put('/api/state', (req, res) => {
  state[req.body.key] = req.body.value
  res.status(204)
  res.end()
})
// get
app.get('/api/state/:key', (req, res) => res.send(state[req.params.key]))
// bind + listen
app.listen(3000, () => console.log('Listening...'))
