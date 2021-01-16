const { runMain, runDocker } = require('./function')

runMain(async (logger) => {
  // TODO: NOTE: this remove too much, build cache should live longer
  // logger.padLog('system')
  // await runDocker([ 'system', 'prune', '--force' ]).promise

  logger.padLog('container')
  await runDocker([ 'container', 'prune', '--force' ]).promise

  logger.padLog('image')
  await runDocker([ 'image', 'prune', '--force' ]).promise
}, 'docker-prune')
