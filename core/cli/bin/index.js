#! /usr/bin/env node

const importLocal = require('import-local')
const log = require('@icream-cli/log')

if (importLocal(__filename)) {
  log.info('cli', '正在使用icream-cli本地版本')
} else {
  // Code for both global and local version here…
  require('../lib')(process.argv.slice(2))
}
