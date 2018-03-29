'use strict'

const express = require('express')
const NodeCache = require('node-cache')
const requestPromise = require('request-promise')
const bluebird = require('bluebird')
const moment = require('moment')
const app = express()
const path = require('path')
const port = process.env.PORT || 8000
const cache = new NodeCache({ stdTTL: 360, checkperiod: 400 })
const router = express.Router()
const coinApiEndPoint = 'https://api.coinmarketcap.com/v1/ticker'
const totalMarketCapApiEndPoint = 'https://api.coinmarketcap.com/v1/global/'
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

const formatPercentage = percentage => {
  if (!percentage) { // for newer coins, this may be null
    return 'N/A'
  }
  if (percentage[0] !== '-') {
    percentage = '+' + percentage
  }
  return percentage
}

const formatAmount = amount => {
  amount = amount.toString()
  const parts = amount.split('.')

  if (parts[1]) {
    if (parts[0] > 0) { // if greater than or equal to $1
      // trim to hundreths place
      parts[1] = parts[1].slice(0, 2)
    } else {
      // trim to millionths place
      parts[1] = parts[1].slice(0, 6)
    }
  }

  if (amount < 1000) {
    amount = `${parts[0]}.${parts[1]}`
    return amount
  }

  // add commas
  // https://stackoverflow.com/a/10899795
  // const parts = amount.split('.')
  let amountWithCommas = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (parts[1] ? '.' + parts[1] : '')

  // if amount ends with .0 (such as a typical market cap amount)
  if (amountWithCommas.slice(-2) === '.0') {
    amountWithCommas = amountWithCommas.slice(0, -2)
  }

  return amountWithCommas
}

const parseTotalMarketCap = totalMarketCap => {
  return formatAmount(totalMarketCap['total_market_cap_usd'])
}

const parseCoins = coins => {
  const parsedCoins = []

  for (let i = 0; i < coins.length; i++) {
    const coin = coins[i]
    parsedCoins.push({
      'name': coin['name'],
      'price_usd': formatAmount(coin['price_usd']),
      'percent_change_1h': formatPercentage(coin['percent_change_1h']),
      'percent_change_24h': formatPercentage(coin['percent_change_24h']),
      'percent_change_7d': formatPercentage(coin['percent_change_7d']),
      'market_cap_usd': formatAmount(coin['market_cap_usd'])
    })
  }
  return parsedCoins
}

const renderHomePage = (res, cachedData) => {
  res.render('homepage', {
    timeOfUpdate: cachedData.timeOfUpdate.fromNow(),
    coins: cachedData.coins,
    totalMarketCap: cachedData.totalMarketCap
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
      bluebird.all([
        requestPromise(coinApiEndPoint),
        requestPromise(totalMarketCapApiEndPoint)
      ])
        .spread((responseFromRequest1, responseFromRequest2) => {
          console.log('Fetched coins and total market cap')
          const parsedCoins = parseCoins(JSON.parse(responseFromRequest1))
          const parsedTotalMarketCap = parseTotalMarketCap(JSON.parse(responseFromRequest2))

          const dataToCache = {
            timeOfUpdate: moment(),
            coins: parsedCoins,
            totalMarketCap: parsedTotalMarketCap
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
        })
        .catch(err => {
          console.error('Error:', err)
          res.status(500)
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
