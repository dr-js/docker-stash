const { runDockerSync } = require('@dr-js/core/library/node/module/Software/docker.js')
const { runKit } = require('@dr-js/core/library/node/kit.js')

runKit(async (kit) => {
  // TODO: NOTE: this remove too much, build cache should live longer
  // kit.padLog('system')
  // runDockerSync([ 'system', 'prune', '--force' ])

  kit.padLog('container')
  runDockerSync([ 'container', 'prune', '--force' ])

  kit.padLog('image')
  runDockerSync([ 'image', 'prune', '--force' ])
}, { title: 'docker-prune' })
