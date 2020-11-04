const { runMain, toRunDockerConfig, run } = require('./function')

runMain(async (logger) => {
  logger.padLog('container')
  await run(toRunDockerConfig({ argList: [ 'container', 'ls', '--all' ] })).promise

  logger.padLog('image')
  await run(toRunDockerConfig({ argList: [ 'image', 'ls' ] })).promise
}, 'docker-ls')
