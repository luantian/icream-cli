'use strict';

const log = require('@icream-cli/log')
const Command = require('@icream-cli/command')

function init(argv) {
  return new InitCommand(argv)
}

class InitCommand extends Command {
  init() {
    this.projectName = this._argv[0] || ''
    this.opts = this._argv[this._argv.length - 1]
    log.verbose('projectName', this.projectName)
    log.verbose('force', this.opts.force)
  }

  exec() {

  }
}

module.exports = init;
// module.exports.InitCommand = InitCommand;
