const { runMain, dockerSync } = require('./function.js')

runMain(async (logger) => {
  // TODO: NOTE: this remove too much, build cache should live longer
  // logger.padLog('system')
  // dockerSync([ 'system', 'prune', '--force' ])

  logger.padLog('container')
  dockerSync([ 'container', 'prune', '--force' ])

  logger.padLog('image')
  dockerSync([ 'image', 'prune', '--force' ])
}, 'docker-prune')
