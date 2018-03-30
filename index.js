'use strict'

const express = require('express')
const path = require('path')

const router = require('./router')
const middleware = require('./utils/middleware')

const app = express()
const port = process.env.PORT || 8000

app.use(router)
app.use(middleware.errorHandler)
app.use(express.static('public'))

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'public'))

app.listen(port, () => {
  console.log(`We are live on http://localhost:${port}`)
})
