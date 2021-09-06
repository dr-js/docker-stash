const { runDockerSync } = require('@dr-js/core/library/node/module/Software/docker.js')
const { runKit } = require('@dr-js/core/library/node/kit.js')

runKit(async (kit) => {
  kit.padLog('container')
  runDockerSync([ 'container', 'ls', '--all' ])

  kit.padLog('image')
  runDockerSync([ 'image', 'ls' ])
}, { title: 'docker-ls' })
