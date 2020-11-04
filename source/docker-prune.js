const { runMain, toRunDockerConfig, run } = require('./function')

runMain(async (logger) => {
  logger.padLog('system')
  await run(toRunDockerConfig({ argList: [ 'system', 'prune', '--force' ] })).promise
}, 'docker-prune')

// console.log('\n[container] '.padEnd(64, '='))
// runSync(toRunDockerConfig({ argList: [ 'container', 'prune' ] }))
// console.log('\n[image] '.padEnd(64, '='))
// runSync(toRunDockerConfig({ argList: [ 'image', 'prune' ] }))

// also check: https://www.digitalocean.com/community/tutorials/how-to-remove-docker-images-containers-and-volumes
// nuke all: `sudo docker system prune -a`
