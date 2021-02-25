const {
  oneOf,
  runMain, dockerSync,
  fromRoot,
  loadTagCore
} = require('./function')

const [
  , // node
  , // script.js
  PUSH_TARGET = ''
] = process.argv

const BUILD_REPO_GHCR = 'ghcr.io/dr-js/debian'

runMain(async (logger) => {
  const PUSH_TARGET_MAP = {
    'ALL': [ 'BASE', 'CN', 'GHCR' ],
    'BASE-ONLY': [ 'BASE' ],
    'CN-ONLY': [ 'CN' ],
    'GHCR-ONLY': [ 'GHCR' ]
  }
  oneOf(PUSH_TARGET, Object.keys(PUSH_TARGET_MAP))
  logger.padLog(`push target: ${PUSH_TARGET}`)
  const hasTarget = (target) => PUSH_TARGET_MAP[ PUSH_TARGET ].includes(target)

  const { version: BUILD_VERSION } = require(fromRoot('package.json'))
  const BUILD_REPO_DEBIAN10 = require('./debian10/BUILD_REPO.json')
  const BUILD_FLAVOR_LIST_DEBIAN10 = Object.values(require('./debian10/BUILD_FLAVOR_MAP.json')).map(({ NAME }) => NAME)
  const toGitHubTag = (tag) => tag.replace(BUILD_REPO_DEBIAN10, BUILD_REPO_GHCR)

  const TAG_LIST_BASE = [
    loadTagCore(fromRoot(__dirname, 'debian10/'), ''),
    ...BUILD_FLAVOR_LIST_DEBIAN10.map((flavorName) => `${BUILD_REPO_DEBIAN10}:10-${flavorName}-${BUILD_VERSION}`)
  ]
  const TAG_LIST_CN = [
    loadTagCore(fromRoot(__dirname, 'debian10/'), 'CN'),
    ...BUILD_FLAVOR_LIST_DEBIAN10.map((flavorName) => `${BUILD_REPO_DEBIAN10}:10-${flavorName}-${BUILD_VERSION}-cn`)
  ]
  const TAG_LIST_GHCR = TAG_LIST_BASE.map(toGitHubTag)

  if (hasTarget('GHCR')) {
    logger.padLog(`re-tag to: ${BUILD_REPO_GHCR}`)
    for (const tag of TAG_LIST_BASE) dockerSync([ 'tag', tag, toGitHubTag(tag) ])
  }

  logger.padLog('push image')
  for (const tag of [
    ...(hasTarget('GHCR') ? TAG_LIST_GHCR : []), // faster in CI
    ...(hasTarget('BASE') ? TAG_LIST_BASE : []),
    ...(hasTarget('CN') ? TAG_LIST_CN : [])
  ]) {
    logger.log(`push tag: ${tag}`)
    dockerSync([ 'push', tag ])
  }
}, 'docker-push')
