'use strict';


const log = require('npmlog')

// log.level = process.env.LOG_LEVEL || 'verbose' // 判断debug模式

log.heading = 'icream' // 修改log前缀

log.addLevel('success', 2000, { fg: 'green', bold: true }) // 添加自定义命令

module.exports = log;
