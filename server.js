'use strict'

const express = require('express')
const NodeCache = require('node-cache')
const mockData = require('./mock')
const request = require('request')
const app = express()
const port = process.env.PORT || 8000
const cache = new NodeCache({ stdTTL: 5, checkperiod: 10 })
const router = express.Router()
const whiteList = ['localhost:8000']
const apiEndPoint = 'http://localhost:8000/api/mockdata'
const cacheKey = 'coins'

// UTILS -----------------------------------------------------------------------
//
const doesKeyExistInCache = key => {
  return cache.keys().length !== 0 && cache.keys().indexOf(key) !== -1
}

const doesValueExistInCache = key => {
  return cache.get(key) !== undefined
}

const isCacheEmpty = key => {
  if (doesKeyExistInCache(key) && !doesValueExistInCache(key)) {
    cache.flushAll()
    console.log('Cache is flushed')
    return true
  } else {
    return !doesKeyExistInCache(key) && !doesValueExistInCache(key)
  }
}

const getValueInCache = key => {
  return cache.get(key)
}

// MIDDLEWARE ------------------------------------------------------------------
//
router.use((req, res, next) => {
  if (whiteList.indexOf(req.headers.host) !== -1) {
    next()
  } else {
    next(new Error('Request not allowed by CORS'))
  }
})

const errorHandler = (err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
}

// ROUTES ----------------------------------------------------------------------
//
router.get('/', (req, res) => {
  res.json({ message: 'Hooray! Welcome to our API!' })
})

router.route('/coins')
.get((req, res) => {
  if (!isCacheEmpty(cacheKey)) {
    console.log('Cache not empty, returning value')
    res.send(JSON.parse(getValueInCache(cacheKey)))
  } else {
    console.log('Cache is empty, fetching data')
    request(apiEndPoint, (error, response, body) => {
      if (response.statusCode === 200 && !error) {
        cache.set(cacheKey, body, (err, success) => {
          if (success && !err) {
            console.log('Successfully cached data')
            res.send(JSON.parse(body))
          } else {
            console.error('Error caching data')
            res.status(500)
          }
        })
      }
    })
  }
})

router.route('/mockdata')
.get((req, res) => {
  console.log('Getting mock data')
  res.json(mockData)
})

// SERVER STARTUP --------------------------------------------------------------
//
app.use('/api', router)
app.use(errorHandler)

app.listen(port, () => {
  console.log('We are live on ' + port)
})
