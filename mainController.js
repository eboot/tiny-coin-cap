const requestPromise = require('request-promise')
const bluebird = require('bluebird')
const moment = require('moment')

const cacheHelper = require('./utils/cacheHelper')
const coinParser = require('./utils/coinParser')

const coinApiEndPoint = 'https://api.coinmarketcap.com/v1/ticker'
const totalMarketCapApiEndPoint = 'https://api.coinmarketcap.com/v1/global/'
const cacheKey = 'coins'

const mainController = (() => {
  const renderHomePage = (res, cachedData) => {
    res.render('homepage', {
      timeOfUpdate: cachedData.timeOfUpdate.fromNow(),
      coins: cachedData.coins,
      totalMarketCap: cachedData.totalMarketCap
    })
  }

  const getCoins = (req, res) => {
    if (!cacheHelper.isCacheEmpty(cacheKey)) {
      console.log('Cache not empty, returning value')
      const cachedData = cacheHelper.getValueInCache(cacheKey)
      renderHomePage(res, cachedData)
    } else {
      console.log('Cache is empty, fetching data')
      bluebird.all([
        requestPromise(coinApiEndPoint),
        requestPromise(totalMarketCapApiEndPoint)
      ])
        .spread((responseFromRequest1, responseFromRequest2) => {
          console.log('Fetched coins and total market cap')
          const parsedCoins = coinParser.parseCoins(JSON.parse(responseFromRequest1))
          const parsedTotalMarketCap = coinParser.parseTotalMarketCap(JSON.parse(responseFromRequest2))

          const dataToCache = {
            timeOfUpdate: moment(),
            coins: parsedCoins,
            totalMarketCap: parsedTotalMarketCap
          }

          cacheHelper.setValueInCache(cacheKey, dataToCache, (err, success) => {
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
  }

  return {
    getCoins
  }
})()

module.exports = mainController
