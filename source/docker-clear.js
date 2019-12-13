const { runSync } = require('@dr-js/core/library/node/system/Run')
const { COMMAND_DOCKER } = require('./function')

console.log('\n[system] '.padEnd(64, '='))
runSync({ command: COMMAND_DOCKER, argList: [ 'system', 'prune', '--force' ] })

// console.log('\n[container] '.padEnd(64, '='))
// runSync({ command: COMMAND_DOCKER, argList: [ 'container', 'prune' ] })
// console.log('\n[image] '.padEnd(64, '='))
// runSync({ command: COMMAND_DOCKER, argList: [ 'image', 'prune' ] })
