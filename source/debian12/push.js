const { oneOf } = require('@dr-js/core/library/common/verify.js')
const { runDockerSync } = require('@dr-js/core/library/node/module/Software/docker.js')
const { runKit } = require('@dr-js/core/library/node/kit.js')

const {
  DOCKER_BUILD_ARCH_INFO_LIST,
  DEBIAN12_BUILD_REPO, DEBIAN12_BUILD_REPO_GHCR, DEBIAN12_BUILD_FLAVOR_LIST, loadDebian12TagCore,
  TAG_LAYER_CACHE
} = require('../function.js')

const [
  , // node
  , // script.js
  PUSH_TARGET = ''
] = process.argv

runKit(async (kit) => {
  const ARCH_INFO = DOCKER_BUILD_ARCH_INFO_LIST.find((ai) => ai.node === process.arch)
  if (ARCH_INFO === undefined) { throw new Error(`unsupported Arch: ${process.arch}`) } else kit.log(`arch: ${ARCH_INFO.key}`)
  const toArch = (tag) => `${tag}-${ARCH_INFO.key}`

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

  const TAG_LIST_BASE = [
    loadDebian12TagCore(''), ...DEBIAN12_BUILD_FLAVOR_LIST.map(({ NAME: flavorName }) => `${DEBIAN12_BUILD_REPO}:12-${flavorName}-${BUILD_VERSION}`)
    // loadDebian12TagCore('CN'), ...DEBIAN12_BUILD_FLAVOR_LIST.map(({ NAME: flavorName }) => `${DEBIAN12_BUILD_REPO}:12-${flavorName}-${BUILD_VERSION}-cn`)
  ]
  const TAG_LIST_BASE_CACHE = [ // only use cache from BASE for now
    ...DEBIAN12_BUILD_FLAVOR_LIST.map(({ NAME: flavorName }) => `${DEBIAN12_BUILD_REPO}:12-${flavorName}-${TAG_LAYER_CACHE}`)
    // ...DEBIAN12_BUILD_FLAVOR_LIST.map(({ NAME: flavorName }) => `${DEBIAN12_BUILD_REPO}:12-${flavorName}-${TAG_LAYER_CACHE}-cn`)
  ]
  const TAG_LIST_GHCR = TAG_LIST_BASE.map(toGitHubTag)

  if (hasTarget('GHCR')) {
    kit.padLog(`re-tag to: ${DEBIAN12_BUILD_REPO_GHCR}`)
    for (const tag of TAG_LIST_BASE) runDockerSync([ 'image', 'tag', toArch(tag), toGitHubTag(toArch(tag)) ])
  }

  kit.padLog('push image')
  for (const tag of [
    ...(hasTarget('GHCR') ? [ ...TAG_LIST_GHCR ].reverse() : []), // faster in CI
    ...(hasTarget('BASE') ? [ ...TAG_LIST_BASE, ...TAG_LIST_BASE_CACHE ].reverse() : [])
  ]) {
    kit.log(`push tag: ${toArch(tag)}`)
    runDockerSync([ 'image', 'push', toArch(tag) ])
  }
}, { title: 'push-debian12' })
