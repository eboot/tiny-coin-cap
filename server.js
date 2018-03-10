'use strict'

const express = require('express')
const NodeCache = require('node-cache')
const request = require('request')
const moment = require('moment')
const app = express()
const path = require('path')
const port = process.env.PORT || 8000
const cache = new NodeCache({ stdTTL: 360, checkperiod: 400 })
const router = express.Router()
const apiEndPoint = 'https://api.coinmarketcap.com/v1/ticker'
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

const formatAmount = amount => {
  if (amount < 1000) {
    return amount
  }

  // add commas
  // https://stackoverflow.com/a/10899795
  const parts = amount.split('.')
  let amountWithCommas = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (parts[1] ? '.' + parts[1] : '')

  // if amount ends with .0 (such as a typical market cap amount)
  if (amountWithCommas.slice(-2) === '.0') {
    amountWithCommas = amountWithCommas.slice(0, -2)
  }

  return amountWithCommas
}

const getCoins = coins => {
  const parsedCoins = []

  for (let i = 0; i < coins.length; i++) {
    const coin = coins[i]
    parsedCoins.push({
      'name': coin['name'],
      'price_usd': formatAmount(coin['price_usd']),
      'percent_change_24h': coin['percent_change_24h'],
      'market_cap_usd': formatAmount(coin['market_cap_usd'])
    })
  }
  return parsedCoins
}

const renderHomePage = (res, cachedData) => {
  res.render('homepage', {
    timeOfUpdate: cachedData.timeOfUpdate.fromNow(),
    coins: cachedData.coins
  })
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
      const cachedData = getValueInCache(cacheKey)
      renderHomePage(res, cachedData)
    } else {
      console.log('Cache is empty, fetching data')
      request(apiEndPoint, (error, response, body) => {
        if (response.statusCode === 200 && !error) {
          const dataToCache = {
            timeOfUpdate: moment(),
            coins: getCoins(JSON.parse(body))
          }
          cache.set(cacheKey, dataToCache, (err, success) => {
            if (success && !err) {
              console.log('Successfully cached data')
              renderHomePage(res, dataToCache)
            } else {
              console.error('Error caching data')
              res.status(500)
            }
          })
        }
      })
    }
  })

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
