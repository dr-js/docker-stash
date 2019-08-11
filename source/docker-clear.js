const { runSync } = require('dr-js/library/node/system/Run')
const { COMMAND_DOCKER } = require('./function')

console.log('\n[container] '.padEnd(64, '='))
runSync({ command: COMMAND_DOCKER, argList: [ 'container', 'prune' ] })

console.log('\n[image] '.padEnd(64, '='))
runSync({ command: COMMAND_DOCKER, argList: [ 'image', 'prune' ] })

