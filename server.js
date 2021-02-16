const express = require('express')

const state = {}

const app = express()
// middleware
app.use(express.json())
// static
app.get('/', express.static('./'))
// insert
app.put('/state', (req, res) => {
  state[req.body.key] = req.body.value
  res.status(204)
  res.end()
})
// get
app.get('/state', (req, res) => res.send(state))
// bind + listen
app.listen(3000, () => console.log('Listening...'))
