const { runMain, toRunDockerConfig, run } = require('./function')

runMain(async (logger) => {
  // TODO: NOTE: this remove too much, build cache should live longer
  // logger.padLog('system')
  // await run(toRunDockerConfig({ argList: [ 'system', 'prune', '--force' ] })).promise

  logger.padLog('container')
  await run(toRunDockerConfig({ argList: [ 'container', 'prune', '--force' ] })).promise

  logger.padLog('image')
  await run(toRunDockerConfig({ argList: [ 'image', 'prune', '--force' ] })).promise
}, 'docker-prune')
