const { oneOf } = require('@dr-js/core/library/common/verify.js')
const { runDockerSync } = require('@dr-js/core/library/node/module/Software/docker.js')
const { runKit } = require('@dr-js/core/library/node/kit.js')

const {
  DOCKER_BUILD_ARCH_INFO_LIST,
  DEBIAN12_BUILD_REPO, DEBIAN12_BUILD_REPO_GHCR, DEBIAN12_BUILD_FLAVOR_LIST // loadDebian12TagCore,
} = require('../function.js')

const [
  , // node
  , // script.js
  PUSH_TARGET = ''
] = process.argv

runKit(async (kit) => {
  const PUSH_TARGET_MAP = {
    'ALL': [ 'BASE', 'GHCR' ],
    'BASE-ONLY': [ 'BASE' ],
    'GHCR-ONLY': [ 'GHCR' ]
  }
  oneOf(PUSH_TARGET, Object.keys(PUSH_TARGET_MAP))
  kit.padLog(`push target: ${PUSH_TARGET}`)
  const hasTarget = (target) => PUSH_TARGET_MAP[ PUSH_TARGET ].includes(target)

  const { version: BUILD_VERSION } = require(kit.fromRoot('package.json'))
  const toGitHubTag = (tag) => tag.replace(DEBIAN12_BUILD_REPO, DEBIAN12_BUILD_REPO_GHCR)

  const TAG_LIST_BASE = [ // NOTE: skip core tag, as local push will need build or manual edit to keep up with latest
    // loadDebian12TagCore(''),
    ...DEBIAN12_BUILD_FLAVOR_LIST.map(({ NAME: flavorName }) => `${DEBIAN12_BUILD_REPO}:12-${flavorName}-${BUILD_VERSION}`)
    // loadDebian12TagCore('CN'),
    // ...DEBIAN12_BUILD_FLAVOR_LIST.map(({ NAME: flavorName }) => `${DEBIAN12_BUILD_REPO}:12-${flavorName}-${BUILD_VERSION}-cn`)
  ]
  const TAG_LIST_GHCR = TAG_LIST_BASE.map(toGitHubTag)

  kit.padLog('push manifest')
  for (const tag of [
    ...(hasTarget('GHCR') ? [ ...TAG_LIST_GHCR ].reverse() : []), // faster in CI
    ...(hasTarget('BASE') ? [ ...TAG_LIST_BASE ].reverse() : [])
  ]) {
    kit.log(`push manifest: ${tag}`)
    runDockerSync([ 'manifest', 'create', tag, ...DOCKER_BUILD_ARCH_INFO_LIST.map((DOCKER_BUILD_ARCH_INFO) => [ '--amend', `${tag}-${DOCKER_BUILD_ARCH_INFO.key}` ]).flat(1) ])
    runDockerSync([ 'manifest', 'push', tag ])
  }
}, { title: 'push-manifest' })
