'use strict'

const formatHelper = require('./formatHelper')

const coinParser = (() => {
  const parseTotalMarketCap = totalMarketCap => {
    return formatHelper.formatAmount(totalMarketCap['total_market_cap_usd'])
  }

  const parseCoins = coins => {
    const parsedCoins = []

    for (let i = 0; i < coins.length; i++) {
      const coin = coins[i]
      parsedCoins.push({
        'name': coin['name'],
        'price_usd': formatHelper.formatAmount(coin['price_usd']),
        'percent_change_1h': formatHelper.formatPercentage(coin['percent_change_1h']),
        'percent_change_24h': formatHelper.formatPercentage(coin['percent_change_24h']),
        'percent_change_7d': formatHelper.formatPercentage(coin['percent_change_7d']),
        'market_cap_usd': formatHelper.formatAmount(coin['market_cap_usd'])
      })
    }
    return parsedCoins
  }

  return {
    parseTotalMarketCap,
    parseCoins
  }
})()

module.exports = coinParser
