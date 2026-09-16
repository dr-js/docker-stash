const { resolve } = require('node:path')

const { existPathSync } = require('@dr-js/core/library/node/fs/Path.js')
const { createDirectory } = require('@dr-js/core/library/node/fs/Directory.js')
const { modifyCopySync } = require('@dr-js/core/library/node/fs/Modify.js')
const { runDockerSync } = require('@dr-js/core/library/node/module/Software/docker.js')

const { IMG_VALKEY9 } = require('./res-list.js')

// - why not use official Binary Artifacts at https://valkey.io/download/:
//   - the docker version have jemalloc fix for 64K pages size arm64 system, official Binary Artifacts do not patch this
//   - the error message: <jemalloc>: Unsupported system page size
//   - `--with-lg-page=16` patch: https://github.com/valkey-io/valkey-container/blob/baeeb587505911a01921affa12bc44fc8cc97310/9.1/debian/Dockerfile#L42-L52

const prepareValkey9WithLocalCache = async ({ fileOutput, pathCache }) => {
  await createDirectory(pathCache)

  const imgPlatform = process.arch === 'arm64' ? 'linux/arm64' : 'linux/amd64'
  const fileCacheName = `${`${IMG_VALKEY9}:${imgPlatform}`.replaceAll(/\W/g, '_')}.tar`
  const fileCachePath = resolve(pathCache, fileCacheName)
  if (!existPathSync(fileCachePath)) {
    console.log(' - pull docker image:', IMG_VALKEY9, imgPlatform)
    runDockerSync([ 'image', 'pull', '--platform', imgPlatform, IMG_VALKEY9 ])
    runDockerSync([ 'image', 'tag', IMG_VALKEY9, `${IMG_VALKEY9}-${process.arch}` ])
    runDockerSync([ 'image', 'rm', IMG_VALKEY9 ])

    console.log(' - pack as tar from image:', fileCacheName)
    runDockerSync([ 'container', 'run', '--rm', `-v=${pathCache}:/mnt`, '--entrypoint=', `${IMG_VALKEY9}-${process.arch}`,
      'tar', '--owner=0', '--group=0', '--numeric-owner', '--sort=name', '-cf', `/mnt/${fileCacheName}`, '-C', '/usr/local/bin/', 'valkey-cli', 'valkey-server'
    ])
  } else console.log(' - cache hit:', fileCacheName)

  await modifyCopySync(fileCachePath, fileOutput)
}

module.exports = {
  prepareValkey9WithLocalCache
}
