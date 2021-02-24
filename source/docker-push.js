const {
  oneOf,
  runMain, runDocker,
  fromRoot,
  loadTagCore
} = require('./function')

const [
  , // node
  , // script.js
  PUSH_TARGET = ''
] = process.argv

oneOf(PUSH_TARGET, [ 'ALL', 'CN-ONLY' ])

runMain(async (logger) => {
  logger.padLog(`push: ${PUSH_TARGET}`)

  const IS_PUSH_CN_ONLY = [ 'CN-ONLY' ].includes(PUSH_TARGET)

  const { version: BUILD_VERSION } = require(fromRoot('package.json'))
  const BUILD_REPO_DEBIAN10 = require('./debian10/BUILD_REPO.json')
  const BUILD_FLAVOR_LIST_DEBIAN10 = Object.values(require('./debian10/BUILD_FLAVOR_MAP.json')).map(({ NAME }) => NAME)
  const BUILD_REPO_GHCR = 'ghcr.io/dr-js/debian'
  const toGitHubTag = (tag) => tag.replace(BUILD_REPO_DEBIAN10, BUILD_REPO_GHCR)

  const TAG_LIST = [
    loadTagCore(fromRoot(__dirname, 'debian10/'), ''),
    ...BUILD_FLAVOR_LIST_DEBIAN10.map((flavorName) => `${BUILD_REPO_DEBIAN10}:10-${flavorName}-${BUILD_VERSION}`)
  ]
  const TAG_LIST_CN = [
    loadTagCore(fromRoot(__dirname, 'debian10/'), 'CN'),
    ...BUILD_FLAVOR_LIST_DEBIAN10.map((flavorName) => `${BUILD_REPO_DEBIAN10}:10-${flavorName}-${BUILD_VERSION}-cn`)
  ]
  const TAG_LIST_GHCR = TAG_LIST.map(toGitHubTag)
  if (!IS_PUSH_CN_ONLY) for (const tag of TAG_LIST) await runDocker([ 'tag', tag, toGitHubTag(tag) ]).promise // re-tag image

  const PUSH_TAG_LIST = IS_PUSH_CN_ONLY ? TAG_LIST_CN : [
    ...TAG_LIST,
    ...TAG_LIST_CN,
    ...TAG_LIST_GHCR
  ]

  for (const tag of PUSH_TAG_LIST) {
    logger.log(`push tag: ${tag}`)
    await runDocker([ 'push', tag ]).promise
  }
}, 'docker-push')
