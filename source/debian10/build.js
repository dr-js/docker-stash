const { runMain, run } = require('../function')

const [
  , // node
  , // script.js
  BUILD_SCRIPT = 'build-layer.js',
  DOCKER_BUILD_MIRROR = '' // now support "CN" only
] = process.argv

runMain(async (logger) => {
  const BUILD_FLAVOR_LIST_DEBIAN10 = Object.values(require('./BUILD_FLAVOR_MAP.json')).map(({ NAME }) => NAME)

  logger.padLog(`build core ${DOCKER_BUILD_MIRROR}`)
  await run([ 'node', 'build-core.js', DOCKER_BUILD_MIRROR ], { cwd: __dirname }).promise

  for (const flavorName of BUILD_FLAVOR_LIST_DEBIAN10) {
    logger.padLog(`build layer ${flavorName} ${DOCKER_BUILD_MIRROR}`)
    await run([ 'node', BUILD_SCRIPT, flavorName, DOCKER_BUILD_MIRROR ], { cwd: __dirname }).promise
  }
}, 'build')
