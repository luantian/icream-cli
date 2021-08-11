'use strict';

const cp = require('child_process')
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
    try {
      const args = Array.from(arguments)
      const cmd = args[args.length - 1]
      const o = {}
      Object.keys(cmd).forEach(key => {
        if (cmd.hasOwnProperty(key) && !key.startsWith('_') && key !== 'parent') {
          o[key] = cmd[key]
        }
      })
      args[args.length - 1] = o

      const code = `require('${rootFile}').call(null, ${JSON.stringify(args)})`
      const child = spawn('node', ['-e', code], {
        cwd: process.cwd(),
        stdio: 'inherit'
      })
      child.on('error', e => {
        log.error(e.message)
        process.exit(1)
      })
      child.on('exit', e => {
        log.verbose('命令执行成功：' + e)
      })
    } catch (error) {
      log.error(error.message)
    }
    // 在node子进程中进行调用
  }

}

// windows的兼容
function spawn(command, args, options) {
  const win32 = process.platform === 'win32'
  const cmd = win32 ? 'cmd' : command
  const cmdArgs = win32 ? ['/c'].concat(command, args) : args
  return cp.spawn(cmd, cmdArgs, options || {})
}

module.exports = exec;
