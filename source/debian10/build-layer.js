const { dockerWithTee } = require('@dr-js/dev/library/docker')
const {
  writeFileSync,
  oneOf, modifyCopy,
  runMain, resetDirectory,
  fromRoot, fromCache, fromOutput,
  fetchFileWithLocalCache,
  loadTagCore, loadRepo,
  TAG_LAYER_CACHE, TAG_LAYER_MAIN_CACHE
} = require('../function')

const { version: BUILD_VERSION } = require(fromRoot('package.json'))
const BUILD_REPO = loadRepo(__dirname)
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

const BUILD_FLAVOR = Object.values(BUILD_FLAVOR_MAP).find((FLAVOR) => BUILD_FLAVOR_NAME === FLAVOR.NAME)
const getFlavoredTag = (name, version = BUILD_VERSION) => `10-${name}-${version}${DOCKER_BUILD_MIRROR && `-${DOCKER_BUILD_MIRROR.toLowerCase()}`}`
const getFlavoredImageTag = (name, version = BUILD_VERSION) => name === '@CORE'
  ? loadTagCore(__dirname, DOCKER_BUILD_MIRROR)
  : `${BUILD_REPO}:${getFlavoredTag(name, version)}`

runMain(async (logger) => {
  const BUILD_TAG = getFlavoredTag(BUILD_FLAVOR.NAME)
  const PATH_BUILD = fromOutput('debian10', `${BUILD_FLAVOR.NAME}${DOCKER_BUILD_MIRROR}`) // leave less file around
  const PATH_LOG = fromOutput('debian10', `layer#${BUILD_VERSION}#${BUILD_TAG}.log`)

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
    /^node/.test(BUILD_FLAVOR.NAME) && '0-2-base-node.sh',
    /^j?ruby/.test(BUILD_FLAVOR.NAME) && '0-3-base-ruby.sh',
    BUILD_FLAVOR.LAYER_SCRIPT
  ].filter(Boolean)) await modifyCopy(fromRoot(__dirname, 'build-layer-script/', file), fromOutput(PATH_BUILD, 'build-layer-script/', file))

  logger.padLog('assemble "build-layer-resource/"')
  {
    // update at 2021/06/18, to find download from: https://deb.nodesource.com/node_14.x/dists/buster/main/binary-amd64/Packages
    // and: https://deb.nodesource.com/node_14.x/pool/main/n/nodejs/
    const DEB_NODEJS = [ 'https://deb.nodesource.com/node_14.x/pool/main/n/nodejs/nodejs_14.17.1-1nodesource1_amd64.deb', '1c035be7cfe991c03d5034a8b740537409ca5dff8afb9a85723f3e4d0fdea35e' ]
    // update at 2020/04/23, to find download from: `npm view npm@latest-6`
    const TGZ_NPM = [ 'https://registry.npmjs.org/npm/-/npm-6.14.13.tgz', 'SRl4jJi0EBHY2xKuu98FLRMo3VhYQSA6otyLnjSEiHoSG/9shXCFNJy9tivpUJvtkN9s6VDdItHa5Rn+fNBzag==:sha512:base64' ]
    // update at 2021/06/18, to find download from: https://nginx.org/en/download.html
    // and: https://github.com/google/ngx_brotli
    const TGZ_NGINX = [ 'https://nginx.org/download/nginx-1.20.1.tar.gz', 'e462e11533d5c30baa05df7652160ff5979591d291736cfa5edb9fd2edb48c49' ] // TODO: need to calc hash yourself
    const ZIP_BROTLI = [ 'https://github.com/google/brotli/archive/e61745a6.zip', '4a79fd9fd30bae4d08dab373326cfb21ab0d6b50e0e55564043e35dde7210219', 'brotli.zip' ] // specify filename // TODO: need to calc hash yourself
    const ZIP_NGX_BROTLI = [ 'https://github.com/google/ngx_brotli/archive/9aec15e2.zip', '9ec37453ef1a4866590e96bc8df41657382281afcdcc0d368947544e9950d8f9', 'ngx-brotli.zip' ] // specify filename // TODO: need to calc hash yourself
    // update at 2021/04/23, to find download from: https://www.ruby-lang.org/en/downloads/releases/
    const TGZ_RUBY = [ 'https://cache.ruby-lang.org/pub/ruby/2.7/ruby-2.7.3.tar.gz', '8925a95e31d8f2c81749025a52a544ea1d05dad18794e6828709268b92e55338' ]
    // update at 2021/06/18, to find download from: https://www.jruby.org/download or https://github.com/jruby/jruby/releases/
    const TGZ_JRUBY = [ 'https://repo1.maven.org/maven2/org/jruby/jruby-dist/9.2.19.0/jruby-dist-9.2.19.0-bin.tar.gz', '1f74885a2d3fa589fcbeb292a39facf7f86be3eac1ab015e32c65d32acf3f3bf' ]

    const fromOutputResource = (...args) => fromOutput(PATH_BUILD, 'build-layer-resource/', ...args)
    await resetDirectory(fromOutputResource())
    await fetchFileWithLocalCache([
      ...(BUILD_FLAVOR === BUILD_FLAVOR_MAP.FLAVOR_NODE ? [ DEB_NODEJS, TGZ_NPM ] : []),
      ...(BUILD_FLAVOR === BUILD_FLAVOR_MAP.FLAVOR_BIN_NGINX ? [ TGZ_NGINX, ZIP_BROTLI, ZIP_NGX_BROTLI ] : []),
      ...(BUILD_FLAVOR === BUILD_FLAVOR_MAP.FLAVOR_RUBY ? [ TGZ_RUBY ] : []),
      ...(BUILD_FLAVOR === BUILD_FLAVOR_MAP.FLAVOR_JRUBY ? [ TGZ_JRUBY ] : [])
    ].map(([ url, hash, filename ]) => [ url, hash, fromOutputResource(), filename ]), fromCache('debian10', 'layer-url'))
  }

  logger.padLog('build image')
  await dockerWithTee([
    'image', 'build',
    '--tag', getFlavoredImageTag(BUILD_FLAVOR.NAME),
    '--tag', getFlavoredImageTag(BUILD_FLAVOR.NAME, TAG_LAYER_CACHE), // NOTE: for layer to use as base, so version-bump won't change Dockerfile
    '--cache-from', [ ...new Set([ // cache tag
      getFlavoredImageTag(BUILD_FLAVOR.NAME, TAG_LAYER_CACHE), // try same label first
      getFlavoredImageTag(BUILD_FLAVOR.NAME, TAG_LAYER_MAIN_CACHE) // try `main` next
    ]) ].join(','), // https://github.com/moby/moby/issues/34715#issuecomment-425933774
    '--build-arg', 'BUILDKIT_INLINE_CACHE=1', // save build cache metadata // https://docs.docker.com/engine/reference/commandline/build/#specifying-external-cache-sources
    '--file', './Dockerfile',
    '--progress=plain', // https://docs.docker.com/develop/develop-images/build_enhancements/#new-docker-build-command-line-build-output
    '.' // context is always CWD
  ], { cwd: PATH_BUILD }, PATH_LOG)
}, `build-${BUILD_FLAVOR.NAME}${DOCKER_BUILD_MIRROR && `-${DOCKER_BUILD_MIRROR}`}`)

const getLayerDockerfileString = ({
  BUILD_FLAVOR, getFlavoredImageTag
}) => `# syntax = ${BUILDKIT_SYNTAX}
FROM ${getFlavoredImageTag(BUILD_FLAVOR.BASE_IMAGE, TAG_LAYER_CACHE)}
RUN \\
  --mount=type=cache,target=/var/log \\
  --mount=type=cache,target=/var/cache \\
  --mount=type=cache,target=/var/lib/apt \\
  --mount=type=bind,target=/mnt/,source=. \\
    cd /mnt/build-layer-script/ \\
 && . ${BUILD_FLAVOR.LAYER_SCRIPT}
`
