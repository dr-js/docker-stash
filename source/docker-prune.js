const { runDockerSync } = require('@dr-js/core/library/node/module/Software/docker.js')
const { runMain } = require('./function.js')

runMain(async (logger) => {
  // TODO: NOTE: this remove too much, build cache should live longer
  // logger.padLog('system')
  // runDockerSync([ 'system', 'prune', '--force' ])

  logger.padLog('container')
  runDockerSync([ 'container', 'prune', '--force' ])

  logger.padLog('image')
  runDockerSync([ 'image', 'prune', '--force' ])
}, 'docker-prune')
