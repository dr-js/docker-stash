const {
  writeFileSync,
  oneOf, modifyCopy,
  runMain, resetDirectory,
  fromRoot, fromCache, fromOutput,
  runDocker,
  fetchFileWithLocalCache,
  loadTagCore
} = require('../function')

const { version: BUILD_VERSION } = require(fromRoot('package.json'))
const BUILD_REPO = require('./BUILD_REPO.json')
const BUILDKIT_SYNTAX = require('./BUILDKIT_SYNTAX.json')
const BUILD_FLAVOR_MAP = require('./BUILD_FLAVOR_MAP.json')

const [
  , // node
  , // script.js
  BUILD_FLAVOR_NAME = '',
  DOCKER_BUILD_MIRROR = '' // now support "CN" only
] = process.argv
oneOf(BUILD_FLAVOR_NAME, Object.values(BUILD_FLAVOR_MAP).map(({ NAME }) => NAME))
oneOf(DOCKER_BUILD_MIRROR, [ '', 'CN' ])

const BUILD_FLAVOR = Object.values(BUILD_FLAVOR_MAP).find((FLAVOR) => BUILD_FLAVOR_NAME === FLAVOR.NAME && FLAVOR)
const getFlavoredTag = (name, version = BUILD_VERSION) => `10-${name}-${version}${DOCKER_BUILD_MIRROR && `-${DOCKER_BUILD_MIRROR.toLowerCase()}`}`
const getFlavoredImageTag = (name, version = BUILD_VERSION) => name === '@CORE'
  ? loadTagCore(__dirname, DOCKER_BUILD_MIRROR)
  : `${BUILD_REPO}:${getFlavoredTag(name, version)}`

// update at 2021/01/13, to find download from: https://deb.nodesource.com/node_14.x/dists/buster/main/binary-amd64/Packages
// and: https://deb.nodesource.com/node_14.x/pool/main/n/nodejs/
const DEB_NODEJS = [ 'https://deb.nodesource.com/node_14.x/pool/main/n/nodejs/nodejs_14.15.4-1nodesource1_amd64.deb', '011452a8d85ae4be8a4680a1120f90822c0c4ffd64fe88c1a5b75163409b27cf' ]
// update at 2020/01/13, to find download from: https://registry.npmjs.org/npm/latest (under `dist.tarball`)
const TGZ_NPM = [ 'https://registry.npmjs.org/npm/-/npm-6.14.11.tgz', '1Zh7LjuIoEhIyjkBflSSGzfjuPQwDlghNloppjruOH5bmj9midT9qcNT0tRUZRR04shU9ekrxNy9+UTBrqeBpQ==:sha512:base64' ]

// update at 2021/01/13, to find download from: https://nginx.org/en/download.html
// and: https://github.com/google/ngx_brotli
const TGZ_NGINX = [ 'https://nginx.org/download/nginx-1.18.0.tar.gz', '4c373e7ab5bf91d34a4f11a0c9496561061ba5eee6020db272a17a7228d35f99' ] // TODO: need to calc hash yourself
const ZIP_BROTLI = [ 'https://github.com/google/brotli/archive/e61745a6.zip', '4a79fd9fd30bae4d08dab373326cfb21ab0d6b50e0e55564043e35dde7210219' ] // TODO: need to calc hash yourself
const ZIP_NGX_BROTLI = [ 'https://github.com/google/ngx_brotli/archive/9aec15e2.zip', '9ec37453ef1a4866590e96bc8df41657382281afcdcc0d368947544e9950d8f9' ] // TODO: need to calc hash yourself

runMain(async (logger) => {
  const BUILD_TAG = getFlavoredTag(BUILD_FLAVOR.NAME)
  const PATH_BUILD = fromOutput('debian', BUILD_FLAVOR.NAME) // leave less file around
  const PATH_LOG = fromOutput('debian', `${BUILD_TAG}.log`)

  logger.padLog('build config')
  logger.log('BUILD_TAG:', BUILD_TAG)
  logger.log('PATH_BUILD:', PATH_BUILD)

  logger.padLog('assemble "/" (context)')
  await resetDirectory(PATH_BUILD)
  writeFileSync(fromOutput(PATH_BUILD, 'Dockerfile'), getLayerDockerfileString({ BUILD_FLAVOR, getFlavoredImageTag }))

  logger.padLog('assemble "build-layer-script/"')
  await resetDirectory(fromOutput(PATH_BUILD, 'build-layer-script/'))
  for (const file of [
    '0-0-base.sh',
    '0-1-base-apt.sh',
    BUILD_FLAVOR.NAME.startsWith('node') && '0-2-base-node.sh',
    BUILD_FLAVOR.LAYER_SCRIPT
  ].filter(Boolean)) await modifyCopy(fromRoot(__dirname, 'build-layer-script/', file), fromOutput(PATH_BUILD, 'build-layer-script/', file))

  logger.padLog('assemble "build-layer-node|bin-nginx|ruby|jruby/"')
  await fetchFileWithLocalCache([
    ...(BUILD_FLAVOR !== BUILD_FLAVOR_MAP.FLAVOR_NODE ? [] : [
      [ ...DEB_NODEJS, fromOutput(PATH_BUILD, 'build-layer-node/') ],
      [ ...TGZ_NPM, fromOutput(PATH_BUILD, 'build-layer-node/') ]
    ]),
    ...(BUILD_FLAVOR !== BUILD_FLAVOR_MAP.FLAVOR_BIN_NGINX ? [] : [
      [ ...TGZ_NGINX, fromOutput(PATH_BUILD, 'build-layer-bin-nginx/') ],
      [ ...ZIP_BROTLI, fromOutput(PATH_BUILD, 'build-layer-bin-nginx/'), 'brotli.zip' ],
      [ ...ZIP_NGX_BROTLI, fromOutput(PATH_BUILD, 'build-layer-bin-nginx/'), 'ngx-brotli.zip' ]
    ])
  ], fromCache('debian', '10-layer-url'))

  logger.padLog('build image')
  await runDocker([
    'image', 'build',
    '--tag', getFlavoredImageTag(BUILD_FLAVOR.NAME),
    '--tag', getFlavoredImageTag(BUILD_FLAVOR.NAME, LOCAL_BUILD_LATEST), // NOTE: for layer to use as base, so version-bump won't change Dockerfile
    '--file', './Dockerfile',
    '--progress=plain', // https://docs.docker.com/develop/develop-images/build_enhancements/#new-docker-build-command-line-build-output
    '.' // context is always CWD
  ], { cwd: PATH_BUILD }, PATH_LOG)
}, `build-${BUILD_FLAVOR.NAME}${DOCKER_BUILD_MIRROR && `-${DOCKER_BUILD_MIRROR}`}`)

const getLayerDockerfileString = ({
  BUILD_FLAVOR, getFlavoredImageTag
}) => `# syntax = ${BUILDKIT_SYNTAX}
FROM ${getFlavoredImageTag(BUILD_FLAVOR.BASE_IMAGE, LOCAL_BUILD_LATEST)}
RUN \\
  --mount=type=cache,target=/var/log \\
  --mount=type=cache,target=/var/cache \\
  --mount=type=cache,target=/var/lib/apt \\
  --mount=type=bind,target=/mnt/,source=. \\
    cd /mnt/build-layer-script/ \\
 && . ${BUILD_FLAVOR.LAYER_SCRIPT}
`

const LOCAL_BUILD_LATEST = 'LOCAL_BUILD_LATEST'
