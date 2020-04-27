const { runSync } = require('@dr-js/core/library/node/system/Run')
const { toRunDockerConfig } = require('./function')

console.log('\n[system] '.padEnd(64, '='))
runSync(toRunDockerConfig({ argList: [ 'system', 'prune', '--force' ] }))

// console.log('\n[container] '.padEnd(64, '='))
// runSync(toRunDockerConfig({ argList: [ 'container', 'prune' ] }))
// console.log('\n[image] '.padEnd(64, '='))
// runSync(toRunDockerConfig({ argList: [ 'image', 'prune' ] }))

// also check: https://www.digitalocean.com/community/tutorials/how-to-remove-docker-images-containers-and-volumes
// nuke all: `sudo docker system prune -a`
