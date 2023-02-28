const { run } = require('@dr-js/core/library/node/run.js')
const { runKit } = require('@dr-js/core/library/node/kit.js')
const { DEBIAN11_BUILD_FLAVOR_LIST } = require('../function.js')

runKit(async (kit) => {
  kit.padLog('build core')
  await run([ 'node', 'build-core.js' ], { cwd: __dirname }).promise

  for (const { NAME: flavorName } of DEBIAN11_BUILD_FLAVOR_LIST) {
    kit.padLog(`build layer ${flavorName}`)
    await run([ 'node', 'build-layer.js', flavorName ], { cwd: __dirname }).promise
  }
}, { title: 'build' })
