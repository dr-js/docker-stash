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
      `${BUILD_REPO_DEBIAN10}:10-node-${BUILD_VERSION}`,
      `${BUILD_REPO_DEBIAN10}:10-bin-${BUILD_VERSION}`,
      `${BUILD_REPO_DEBIAN10}:10-full-${BUILD_VERSION}`
    ] : [],

    ...([ 'ALL', 'CN' ].includes(DOCKER_BUILD_MIRROR)) ? [
      loadTagCore(fromRoot(__dirname, 'debian10/'), 'CN'),
      `${BUILD_REPO_DEBIAN10}:10-node-${BUILD_VERSION}-cn`,
      `${BUILD_REPO_DEBIAN10}:10-bin-${BUILD_VERSION}-cn`,
      `${BUILD_REPO_DEBIAN10}:10-full-${BUILD_VERSION}-cn`
    ] : []
  ]

  for (const tag of tagList) {
    logger.log(`push tag: ${tag}`)
    await run(toRunDockerConfig({ argList: [ 'push', tag ] })).promise
  }
}, 'docker-push')
