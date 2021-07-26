const { runDockerSync } = require('@dr-js/core/library/node/module/Software/docker.js')
const { runMain } = require('./function.js')

runMain(async (logger) => {
  logger.padLog('container')
  runDockerSync([ 'container', 'ls', '--all' ])

  logger.padLog('image')
  runDockerSync([ 'image', 'ls' ])
}, 'docker-ls')
