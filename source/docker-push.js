const { oneOf } = require('@dr-js/core/library/common/verify.js')
const { runDockerSync } = require('@dr-js/core/library/node/module/Software/docker.js')
const { runKit } = require('@dr-js/core/library/node/kit.js')

const {
  DEBIAN10_BUILD_REPO, DEBIAN10_BUILD_REPO_GHCR, DEBIAN10_BUILD_FLAVOR_LIST, loadDebian10TagCore,
  DEBIAN11_BUILD_REPO, DEBIAN11_BUILD_REPO_GHCR, DEBIAN11_BUILD_FLAVOR_LIST, loadDebian11TagCore,
  TAG_LAYER_CACHE
} = require('./function.js')

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
  const toGitHubTag = (tag) => tag
    .replace(DEBIAN10_BUILD_REPO, DEBIAN10_BUILD_REPO_GHCR)
    .replace(DEBIAN11_BUILD_REPO, DEBIAN11_BUILD_REPO_GHCR)

  const TAG_LIST_BASE = [
    loadDebian10TagCore(''), ...DEBIAN10_BUILD_FLAVOR_LIST.map(({ NAME: flavorName }) => `${DEBIAN10_BUILD_REPO}:10-${flavorName}-${BUILD_VERSION}`),
    loadDebian10TagCore('CN'), ...DEBIAN10_BUILD_FLAVOR_LIST.map(({ NAME: flavorName }) => `${DEBIAN10_BUILD_REPO}:10-${flavorName}-${BUILD_VERSION}-cn`),
    loadDebian11TagCore(''), ...DEBIAN11_BUILD_FLAVOR_LIST.map(({ NAME: flavorName }) => `${DEBIAN11_BUILD_REPO}:11-${flavorName}-${BUILD_VERSION}`),
    loadDebian11TagCore('CN'), ...DEBIAN11_BUILD_FLAVOR_LIST.map(({ NAME: flavorName }) => `${DEBIAN11_BUILD_REPO}:11-${flavorName}-${BUILD_VERSION}-cn`)
  ]
  const TAG_LIST_BASE_CACHE = [ // only use cache from BASE for now
    ...DEBIAN10_BUILD_FLAVOR_LIST.map(({ NAME: flavorName }) => `${DEBIAN10_BUILD_REPO}:10-${flavorName}-${TAG_LAYER_CACHE}`),
    ...DEBIAN10_BUILD_FLAVOR_LIST.map(({ NAME: flavorName }) => `${DEBIAN10_BUILD_REPO}:10-${flavorName}-${TAG_LAYER_CACHE}-cn`),
    ...DEBIAN11_BUILD_FLAVOR_LIST.map(({ NAME: flavorName }) => `${DEBIAN11_BUILD_REPO}:11-${flavorName}-${TAG_LAYER_CACHE}`),
    ...DEBIAN11_BUILD_FLAVOR_LIST.map(({ NAME: flavorName }) => `${DEBIAN11_BUILD_REPO}:11-${flavorName}-${TAG_LAYER_CACHE}-cn`)
  ]
  const TAG_LIST_GHCR = TAG_LIST_BASE.map(toGitHubTag)

  if (hasTarget('GHCR')) {
    kit.padLog(`re-tag to: ${DEBIAN10_BUILD_REPO_GHCR}/${DEBIAN11_BUILD_REPO_GHCR}`)
    for (const tag of TAG_LIST_BASE) runDockerSync([ 'tag', tag, toGitHubTag(tag) ])
  }

  kit.padLog('push image')
  for (const tag of [
    ...(hasTarget('GHCR') ? [ ...TAG_LIST_GHCR ].reverse() : []), // faster in CI
    ...(hasTarget('BASE') ? [ ...TAG_LIST_BASE, ...TAG_LIST_BASE_CACHE ].reverse() : [])
  ]) {
    kit.log(`push tag: ${tag}`)
    runDockerSync([ 'push', tag ])
  }
}, { title: 'docker-push' })
