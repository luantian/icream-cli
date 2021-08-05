'use strict';

module.exports = core;

const path = require('path')

const semver = require('semver')
const colors = require('colors/safe')
const userHome = require('user-home')
const pathExists = require('path-exists').sync

const log = require('@icream-cli/log')
const pkg = require('../package.json')
const constant = require('./const')


function core() {

  try {
    checkPkgVersion()
    checkNodeVersion()
    checkRoot()
    checkUserHome()
    // 检查入参，主要是判断是否要进入调试模式
    checkInputArgs()
    checkEnv()
    checkGlobalUpdate()

  } catch (error) {
    log.error(error.message)
  }

}

async function checkGlobalUpdate() {

  // 1. 获取当前版本号 和 模块名
  const currentVersion = pkg.version
  const npmName = pkg.name
  // 2. 通过npm api 获取所有版本号
  const { getNpmSemverVersions } = require('@icream-cli/get-npm-info')

  // 3. 提取所有版本号，比对出哪个版本号是大于当前版本号的
  // 4. 获取最新版本号，提示更新到最新版本
  const lastVersion = await getNpmSemverVersions(currentVersion, npmName)

  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn('更新提示', colors.yellow(`请手动更新${npmName}, 当前版本为${currentVersion}, 最新版本为${lastVersion}, 更新命令为 npm install -g ${npmName}`))
  }

}

function checkPkgVersion() {
  log.info(pkg.version)
}

function checkNodeVersion() {

  const currentVersion = process.version
  const lowestNodeVersion = constant.LOWEST_NODE_VERSION

  if (!semver.gte(currentVersion, lowestNodeVersion)) {
    throw new Error(colors.red(`icream-cli 需要安装 ${lowestNodeVersion} 版本以上的nodejs`))
  }

}

function checkRoot() {
  const rootCheck = require('root-check')
  rootCheck()
}

function checkUserHome() {
  if (!userHome || !pathExists(userHome)) {
    throw new Error('当前登录用户主目录不存在')
  }
}

function checkInputArgs() {
  const minimist = require('minimist')
  const args = minimist(process.argv.slice(2))
  if (args.debug) {
    process.env.LOG_LEVEL = 'verbose'
  } else {
    process.env.LOG_LEVEL = 'info'
  }
  log.level = process.env.LOG_LEVEL
}

function checkEnv() {
  const dotenv = require('dotenv')
  const dotenvPath = path.resolve(userHome, '.env')
  let config = {}
  if (pathExists(dotenvPath)) {
    config = dotenv.config({
      path: dotenvPath
    })
  }

  createDefaultConfig()

  log.verbose('环境变量', config, process.env.CLI_HOME_PATH)
}

function createDefaultConfig() {
  const cliConfig = {
    home: userHome
  }
  if (process.env.CLI_HOME) {
    cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME)
  } else {
    cliConfig['cliHome'] = path.join(userHome, constant.DEFAULT_CLI_HOME)
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome
}

/**
 * require 支持加载资源的类型，js/json/node 三种类型 node几乎遇不到
 *
 * require 可以加载其他文件所有文件，会当成js文件解析
 *
 */