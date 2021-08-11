'use strict';

const semver = require('semver')
const colors = require('colors/safe')
const log = require('@icream-cli/log')

// const { isObject } = require('@icream-cli/utils')

const LOWEST_NODE_VERSION = 'v12.0.0'


class Command {
  constructor(argv) {

    if (!argv) {
      throw new Error('Cammand 构造函数参数不能为空')
    }

    if (!Array.isArray(argv)) {
      throw new Error('Cammand 构造函数参数必须为Array')
    }

    if (argv.length === 0) {
      throw new Error('Cammand 参数列表不能为空')
    }

    this._argv = argv

    let runner = new Promise((resolve, reject) => {
      let chain = Promise.resolve()
      chain = chain.then(() => this.checkNodeVersion())
      chain = chain.then(() => this.initArgs())
      chain = chain.then(() => this.init())
      chain = chain.then(() => this.exec())
      chain.catch(error => {
        log.error(error.message)
      })
    })
  }

  initArgs() {
    this._cmd = this._argv[this._argv.length - 1]
    this._argv = this._argv.slice(0, this._argv.length - 1)
  }

  checkNodeVersion() {

    const currentVersion = process.version
    const lowestNodeVersion = LOWEST_NODE_VERSION

    if (!semver.gte(currentVersion, lowestNodeVersion)) {
      throw new Error(colors.red(`icream-cli 需要安装 ${lowestNodeVersion} 版本以上的nodejs`))
    }

  }

  init() {
    throw new Error('必须实现init方法！')
  }

  exec() {
    throw new Error('必须实现exec方法！')
  }

}

module.exports = Command;
