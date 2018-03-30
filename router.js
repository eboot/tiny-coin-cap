'use strict'

const express = require('express')
const mainController = require('./mainController')

const router = express.Router()
router.route('/').get(mainController.getCoins)

module.exports = router
