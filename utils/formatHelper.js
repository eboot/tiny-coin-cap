'use strict'

const formatHelper = (() => {
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

  return {
    formatPercentage,
    formatAmount
  }
})()

module.exports = formatHelper
