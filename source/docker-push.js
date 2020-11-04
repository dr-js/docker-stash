const {
  oneOf,
  runMain,
  fromRoot,
  toRunDockerConfig, run,
  loadTagCore
} = require('./function')

const [
  , // node
  , // script.js
  DOCKER_BUILD_MIRROR = '' // now support "CN" only
] = process.argv

oneOf(DOCKER_BUILD_MIRROR, [ 'ALL', '', 'CN' ])

runMain(async (logger) => {
  logger.padLog('push')
  logger.log(`DOCKER_BUILD_MIRROR: ${DOCKER_BUILD_MIRROR}`)

  const { version: BUILD_VERSION } = require(fromRoot('package.json'))
  const BUILD_REPO_DEBIAN10 = require('./debian10/BUILD_REPO.json')

  const tagList = [
    ...([ 'ALL', '' ].includes(DOCKER_BUILD_MIRROR)) ? [
      loadTagCore(fromRoot(__dirname, 'debian10/'), ''),
      `${BUILD_REPO_DEBIAN10}:${BUILD_VERSION}-10-node`,
      `${BUILD_REPO_DEBIAN10}:${BUILD_VERSION}-10-bin`,
      `${BUILD_REPO_DEBIAN10}:${BUILD_VERSION}-10-full`
    ] : [],

    ...([ 'ALL', 'CN' ].includes(DOCKER_BUILD_MIRROR)) ? [
      loadTagCore(fromRoot(__dirname, 'debian10/'), 'CN'),
      `${BUILD_REPO_DEBIAN10}:${BUILD_VERSION}-10-node-cn`,
      `${BUILD_REPO_DEBIAN10}:${BUILD_VERSION}-10-bin-cn`,
      `${BUILD_REPO_DEBIAN10}:${BUILD_VERSION}-10-full-cn`
    ] : []
  ]

  for (const tag of tagList) {
    logger.log(`push tag: ${tag}`)
    await run(toRunDockerConfig({ argList: [ 'push', tag ] })).promise
  }
}, 'docker-push')
