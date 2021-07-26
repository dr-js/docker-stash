const { oneOf } = require('@dr-js/core/library/common/verify.js')
const { runDockerSync } = require('@dr-js/core/library/node/module/Software/docker.js')
const {
  runMain, fromRoot,
  loadTagCore, loadRepo,
  TAG_LAYER_CACHE
} = require('./function.js')

const [
  , // node
  , // script.js
  PUSH_TARGET = ''
] = process.argv

runMain(async (logger) => {
  const PUSH_TARGET_MAP = {
    'ALL': [ 'BASE', 'GHCR' ],
    'BASE-ONLY': [ 'BASE' ],
    'GHCR-ONLY': [ 'GHCR' ]
  }
  oneOf(PUSH_TARGET, Object.keys(PUSH_TARGET_MAP))
  logger.padLog(`push target: ${PUSH_TARGET}`)
  const hasTarget = (target) => PUSH_TARGET_MAP[ PUSH_TARGET ].includes(target)

  const { version: BUILD_VERSION } = require(fromRoot('package.json'))
  const BUILD_REPO_DEBIAN10 = await loadRepo(fromRoot(__dirname, 'debian10/'))
  const BUILD_REPO_DEBIAN10_GHCR = await loadRepo(fromRoot(__dirname, 'debian10/'), 'GHCR')
  const BUILD_FLAVOR_LIST_DEBIAN10 = Object.values(require('./debian10/BUILD_FLAVOR_MAP.json')).map(({ NAME }) => NAME)
  const toGitHubTag = (tag) => tag.replace(BUILD_REPO_DEBIAN10, BUILD_REPO_DEBIAN10_GHCR)

  const TAG_LIST_BASE = [
    await loadTagCore(fromRoot(__dirname, 'debian10/'), ''),
    ...BUILD_FLAVOR_LIST_DEBIAN10.map((flavorName) => `${BUILD_REPO_DEBIAN10}:10-${flavorName}-${BUILD_VERSION}`),
    await loadTagCore(fromRoot(__dirname, 'debian10/'), 'CN'),
    ...BUILD_FLAVOR_LIST_DEBIAN10.map((flavorName) => `${BUILD_REPO_DEBIAN10}:10-${flavorName}-${BUILD_VERSION}-cn`)
  ]
  const TAG_LIST_BASE_CACHE = [ // only use cache from BASE for now
    ...BUILD_FLAVOR_LIST_DEBIAN10.map((flavorName) => `${BUILD_REPO_DEBIAN10}:10-${flavorName}-${TAG_LAYER_CACHE}`),
    ...BUILD_FLAVOR_LIST_DEBIAN10.map((flavorName) => `${BUILD_REPO_DEBIAN10}:10-${flavorName}-${TAG_LAYER_CACHE}-cn`)
  ]
  const TAG_LIST_GHCR = TAG_LIST_BASE.map(toGitHubTag)

  if (hasTarget('GHCR')) {
    logger.padLog(`re-tag to: ${BUILD_REPO_DEBIAN10_GHCR}`)
    for (const tag of TAG_LIST_BASE) runDockerSync([ 'tag', tag, toGitHubTag(tag) ])
  }

  logger.padLog('push image')
  for (const tag of [
    ...(hasTarget('GHCR') ? [ ...TAG_LIST_GHCR ].reverse() : []), // faster in CI
    ...(hasTarget('BASE') ? [ ...TAG_LIST_BASE, ...TAG_LIST_BASE_CACHE ].reverse() : [])
  ]) {
    logger.log(`push tag: ${tag}`)
    runDockerSync([ 'push', tag ])
  }
}, 'docker-push')
