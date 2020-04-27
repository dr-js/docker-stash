const { runSync } = require('@dr-js/core/library/node/system/Run')
const { toRunDockerConfig } = require('./function')

console.log('\n[container] '.padEnd(64, '='))
runSync(toRunDockerConfig({ argList: [ 'container', 'ls', '--all' ] }))

console.log('\n[image] '.padEnd(64, '='))
runSync(toRunDockerConfig({ argList: [ 'image', 'ls' ] }))
