const { runMain, dockerSync } = require('./function')

runMain(async (logger) => {
  logger.padLog('container')
  dockerSync([ 'container', 'ls', '--all' ])

  logger.padLog('image')
  dockerSync([ 'image', 'ls' ])
}, 'docker-ls')
