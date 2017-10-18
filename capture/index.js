'use strict'
exports = module.exports = {
  darwin: require('./darwin'),
  linux: require('./linux'),
  win32: require('./win32')
}