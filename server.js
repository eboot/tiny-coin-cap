'use strict'

const express = require('express')
const NodeCache = require('node-cache')
const request = require('request')
const app = express()
const path = require('path')
const port = process.env.PORT || 8000
const cache = new NodeCache({ stdTTL: 360, checkperiod: 400 })
const router = express.Router()
const apiEndPoint = 'https://api.coinmarketcap.com/v1/ticker'
const cacheKey = 'coins'

// For mocking
// const mockUnparsed = require('./mock-unparsed')
// const mockParsed = require('./mock-parsed')
// const cache = new NodeCache({ stdTTL: 5, checkperiod: 10 }) // for mock data
// const apiEndPoint = 'http://localhost:8000/api/mockdata' // for mock data

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

const getCoins = coins => {
  const parsedCoins = []

  for (let i = 0; i < coins.length; i++) {
    const coin = coins[i]
    parsedCoins.push({
      'name': coin['name'],
      'price_usd': coin['price_usd'],
      'percent_change_24h': coin['percent_change_24h'],
      'market_cap_usd': coin['market_cap_usd']
    })
  }
  return parsedCoins
}

// MIDDLEWARE ------------------------------------------------------------------
//
const errorHandler = (err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
}

// ROUTES ----------------------------------------------------------------------
//
router.route('/')
  .get((req, res) => {
    if (!isCacheEmpty(cacheKey)) {
      console.log('Cache not empty, returning value')
      const coins = getValueInCache(cacheKey)
      res.render('homepage', {
        coins: coins
      })
    } else {
      console.log('Cache is empty, fetching data')
      request(apiEndPoint, (error, response, body) => {
        if (response.statusCode === 200 && !error) {
          const coins = getCoins(JSON.parse(body))
          cache.set(cacheKey, coins, (err, success) => {
            if (success && !err) {
              console.log('Successfully cached data')
              res.render('homepage', {
                coins: coins
              })
            } else {
              console.error('Error caching data')
              res.status(500)
            }
          })
        }
      })
    }
  })

// MOCK DATA -------------------------------------------------------------------
// router.get('/mock', (req, res) => {
//   res.render('homepage', {
//     coins: mockParsed
//   })
// })

// router.route('/mock-unparsed')
// .get((req, res) => {
//   console.log('Getting unparsed mock data')
//   res.json(mockUnparsed)
// })

// router.route('/mock-parsed')
// .get((req, res) => {
//   console.log('Getting parsed mock data')
//   res.json(mockParsed)
// })

// SERVER STARTUP --------------------------------------------------------------
//
app.use(router)
app.use(errorHandler)
app.use(express.static('public'))

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'public'))

app.listen(port, () => {
  console.log('We are live on ' + port)
})
