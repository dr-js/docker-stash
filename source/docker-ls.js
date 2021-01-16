const { runMain, runDocker } = require('./function')

runMain(async (logger) => {
  logger.padLog('container')
  await runDocker([ 'container', 'ls', '--all' ]).promise

  logger.padLog('image')
  await runDocker([ 'image', 'ls' ]).promise
}, 'docker-ls')
