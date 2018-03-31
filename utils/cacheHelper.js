'use strict'

const NodeCache = require('node-cache')
const cache = new NodeCache({ stdTTL: 360, checkperiod: 400 })

const cacheHelper = (() => {
  const doesKeyExist = key => {
    return cache.keys().length !== 0 && cache.keys().indexOf(key) !== -1
  }

  const doesValueExist = key => {
    return cache.get(key) !== undefined
  }

  const isEmpty = key => {
    if (doesKeyExist(key) && !doesValueExist(key)) {
      cache.flushAll()
      console.log('Cache is flushed')
      return true
    } else {
      return !doesKeyExist(key) && !doesValueExist(key)
    }
  }

  const getValue = key => {
    return cache.get(key)
  }

  const setValue = (key, value) => {
    return cache.set(key, value)
  }

  return {
    doesKeyExist,
    doesValueExist,
    isEmpty,
    getValue,
    setValue
  }
})()

module.exports = cacheHelper
