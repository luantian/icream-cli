'use strict';

const fs = require('fs')
const fse = require('fs-extra')
const inquirer = require('inquirer')
const semver = require('semver')


const log = require('@icream-cli/log')
const Command = require('@icream-cli/command')

const TYPE_PROJECT = 'project'
const TYPE_COMPONENT = 'component'

let prompt = {}
prompt.dirEmpty = {
  type: 'confirm',
  name: 'ifContinue',
  default: false,
  message: '当前文件夹不为空，是否继续创建项目？'
}

prompt.choiceType = {
  type: 'list',
  message: '请选择初始化类型',
  name: 'type',
  default: TYPE_PROJECT,
  choices: [
    {
      name: '项目',
      value: TYPE_PROJECT
    },
    {
      name: '组件',
      value: TYPE_COMPONENT
    },
  ]
}

prompt.projectName = {
  type: 'input',
  name: 'projectName',
  message: '请输入项目名称',
  default: '',
  validate: function(v) {
    const done = this.async()
    setTimeout(() => {
      if (!/^[a-zA-Z]+[\w-]*[a-zA-Z0-9]$/.test(v)) {
        done('输入的项目名称不合法')
        return
      }
      done(null, true)
    }, 0)
  },
  filter: (v) => v
}

prompt.version = {
  type: 'input',
  name: 'version',
  message: '请输入项目版本号',
  default: '0.0.1',
  validate: function(v) {
    const done = this.async()
    setTimeout(() => {
      if (!semver.valid(v)) {
        done('输入的项目名称不合法')
        return
      }
      done(null, true)
    }, 0)
  },
  filter: (v) => semver.valid(v) || v
}

class InitCommand extends Command {
  init() {
    this.projectName = this._argv[0] || ''
    this.opts = this._argv[this._argv.length - 1]
    this.force = this.opts.force
    log.verbose('projectName', this.projectName)
    log.verbose('force', this.force)
  }

  async exec() {
    try {
      // 准备阶段
      // 下载模板
      // 安装模板
      const projectInfo = await this.prepare()

      if (projectInfo) {
        log.verbose('projectInfo', projectInfo)
      }
    } catch (error) {
      log.error(error.message)
    }
  }

  async prepare() {
    // process.cwd() 当前执行命令的路径
    const localPath = process.cwd()

    if (!this.force && !this.isDirEmpty(localPath)) {
      return log.error('当前目录不为空，请清空目录或者--force强制创建项目')
    }

    if (!this.isDirEmpty(localPath) && this.force) {
      const { ifContinue } = await inquirer.prompt(  prompt.dirEmpty )
      if (ifContinue) {
        // 启动强制更新  清空当前目录
        console.log('localPath', localPath)
        // fse.emptyDirSync(localPath)
        console.log('此处执行清空代码，暂时注释')
      } else {
        return
      }
    }

    return this.getProjectInfo()

  }

  async getProjectInfo() {
    // 选择创建项目或者是组件
    let projectInfo = {}
    const { type } = await inquirer.prompt( prompt.choiceType )

    log.verbose('type', type)

    if (type === TYPE_PROJECT) {
      const project = await inquirer.prompt([
        prompt.projectName,
        prompt.version
      ])

      projectInfo = {
        type,
        ...project
      }
    } else if (type === TYPE_COMPONENT) {

    }

    return projectInfo

  }

  isDirEmpty(localPath) {
    let fileList = fs.readdirSync(localPath)
    fileList = fileList.filter(file => (
      !file.startsWith('.') && ['node_modules'].indexOf(file) < 0
    ))
    return !fileList || fileList.length <= 0
  }
}

function init(argv) {
  return new InitCommand(argv)
}

module.exports = init;
// module.exports.InitCommand = InitCommand;
