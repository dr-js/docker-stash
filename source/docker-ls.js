const { runSync } = require('@dr-js/core/library/node/system/Run')
const { COMMAND_DOCKER } = require('./function')

console.log('\n[container] '.padEnd(64, '='))
runSync({ command: COMMAND_DOCKER, argList: [ 'container', 'ls', '--all' ] })

console.log('\n[image] '.padEnd(64, '='))
runSync({ command: COMMAND_DOCKER, argList: [ 'image', 'ls' ] })
