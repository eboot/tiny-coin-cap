'use strict'

const NodeCache = require('node-cache')
const cache = new NodeCache({ stdTTL: 360, checkperiod: 400 })

const cacheHelper = (() => {
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

  const setValueInCache = (key, value, callback) => {
    cache.set(key, value, (err, success) => {
      callback(err, success)
    })
  }

  return {
    doesKeyExistInCache,
    doesValueExistInCache,
    isCacheEmpty,
    getValueInCache,
    setValueInCache
  }
})()

module.exports = cacheHelper
