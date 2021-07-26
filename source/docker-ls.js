const { runMain, dockerSync } = require('./function.js')

runMain(async (logger) => {
  logger.padLog('container')
  dockerSync([ 'container', 'ls', '--all' ])

  logger.padLog('image')
  dockerSync([ 'image', 'ls' ])
}, 'docker-ls')
