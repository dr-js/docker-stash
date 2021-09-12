const { run } = require('@dr-js/core/library/node/run.js')
const { runKit } = require('@dr-js/core/library/node/kit.js')
const { DEBIAN11_BUILD_FLAVOR_LIST } = require('../function.js')

const [
  , // node
  , // script.js
  BUILD_SCRIPT = 'build-layer.js',
  DOCKER_BUILD_MIRROR = '' // now support "CN" only
] = process.argv

runKit(async (kit) => {
  kit.padLog(`build core ${DOCKER_BUILD_MIRROR}`)
  await run([ 'node', 'build-core.js', DOCKER_BUILD_MIRROR ], { cwd: __dirname }).promise

  for (const { NAME: flavorName } of DEBIAN11_BUILD_FLAVOR_LIST) {
    kit.padLog(`build layer ${flavorName} ${DOCKER_BUILD_MIRROR}`)
    await run([ 'node', BUILD_SCRIPT, flavorName, DOCKER_BUILD_MIRROR ], { cwd: __dirname }).promise
  }
}, { title: 'build' })
