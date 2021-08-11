'use strict';

const path = require('path')
const Package = require('@icream-cli/package')
const log = require('@icream-cli/log')

const SETTINGS = {
  init: 'lodash'
}

const CHCHE_DIR = 'dependencies'

async function exec() {
  const homePath = process.env.CLI_HOME_PATH
  let targetPath = process.env.CLI_TARGET_PATH
  let storeDir = ''
  let pkg

  log.verbose('targetPath', targetPath)
  log.verbose('homePath', homePath)

  const command = arguments[arguments.length - 1]
  const cmdName = command.name()
  const packageName = SETTINGS[cmdName]
  const packageVersion = 'latest'

  if (!targetPath) {
    targetPath = path.resolve(homePath, CHCHE_DIR)
    storeDir = path.resolve(targetPath, 'node_modules')
    log.verbose('targetPath', targetPath)
    log.verbose('storeDir', storeDir)

    pkg = new Package({
      targetPath,
      storeDir,
      packageName,
      packageVersion,
    })

    if (await pkg.exists()) {
      // 更新 package
      await pkg.update()
    } else {
      // 安装 package
      await pkg.install()
    }
  } else {
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion,
    })
  }

  const rootFile = pkg.getRootFilePath()
  if (rootFile) {
    require(rootFile).apply(null, arguments)
  }

}

module.exports = exec;
