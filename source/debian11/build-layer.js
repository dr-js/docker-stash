const { writeText } = require('@dr-js/core/library/node/fs/File.js')
const { resetDirectory } = require('@dr-js/core/library/node/fs/Directory.js')
const { modifyCopy } = require('@dr-js/core/library/node/fs/Modify.js')
const { runKit } = require('@dr-js/core/library/node/kit.js')

const { runDockerWithTee } = require('@dr-js/dev/library/docker.js')
const {
  BUILDKIT_SYNTAX, DOCKER_BUILD_ARCH_INFO_LIST,
  DEBIAN11_BUILD_FLAVOR_MAP, verifyDebian11BuildArg,
  fetchFileListWithLocalCache,
  TAG_LAYER_CACHE, TAG_LAYER_MAIN_CACHE
} = require('../function.js')

const [
  , // node
  , // script.js
  BUILD_FLAVOR_NAME = '',
  DOCKER_BUILD_MIRROR = '' // now support "CN" only
] = process.argv

runKit(async (kit) => {
  const { BUILD_FLAVOR, getFlavoredTag, getFlavoredImageTag } = verifyDebian11BuildArg({ BUILD_FLAVOR_NAME, DOCKER_BUILD_MIRROR })

  const BUILD_TAG = getFlavoredTag(BUILD_FLAVOR.NAME)
  const PATH_BUILD = kit.fromOutput('debian11-layer', `${BUILD_FLAVOR.NAME}${DOCKER_BUILD_MIRROR}`) // leave less file around

  kit.padLog('build config')
  kit.log('BUILD_TAG:', BUILD_TAG)
  kit.log('PATH_BUILD:', PATH_BUILD)

  kit.padLog('assemble "/" (context)')
  await resetDirectory(PATH_BUILD)

  for (const DOCKER_BUILD_ARCH_INFO of DOCKER_BUILD_ARCH_INFO_LIST) {
    await writeText(kit.fromOutput(PATH_BUILD, `Dockerfile.${DOCKER_BUILD_ARCH_INFO.key}`), getLayerDockerfileString({ DOCKER_BUILD_ARCH_INFO, BUILD_FLAVOR, getFlavoredImageTag }))
  }

  kit.padLog('assemble "build-layer-script/"')
  await resetDirectory(kit.fromOutput(PATH_BUILD, 'build-layer-script/'))
  for (const file of [
    '0-0-base.sh',
    '0-1-base-apt.sh',
    BUILD_FLAVOR === DEBIAN11_BUILD_FLAVOR_MAP.FLAVOR_RUBY && '0-3-base-ruby.sh',
    BUILD_FLAVOR.LAYER_SCRIPT,
    BUILD_FLAVOR.LAYER_DEP_BUILD_SCRIPT
  ].filter(Boolean)) await modifyCopy(kit.fromRoot(__dirname, 'build-layer-script/', file), kit.fromOutput(PATH_BUILD, 'build-layer-script/', file))

  kit.padLog('assemble "build-layer-resource/"')
  {
    const RES_FLAVOR_NODE = [
      // update at 2022/02/23, to find download:
      // - https://deb.nodesource.com/node_16.x/dists/bullseye/main/binary-amd64/Packages
      // - https://deb.nodesource.com/node_16.x/dists/bullseye/main/binary-arm64/Packages
      [ 'https://deb.nodesource.com/node_16.x/pool/main/n/nodejs/nodejs_16.14.0-deb-1nodesource1_amd64.deb', 'a280f153813f7730242cc79d3e4fced8f6f23bc638bce91905983c2c1ccc3028' ],
      [ 'https://deb.nodesource.com/node_16.x/pool/main/n/nodejs/nodejs_16.14.0-deb-1nodesource1_arm64.deb', 'bbd08307e2e6be9371f93b7a9c965d7e8b047d3140379a7fcd6bbc4b5638c1d2' ],
      // update at 2022/02/23, to find download from: `npm view npm@latest-6`, ` @min-pack/npm`, `npm view @dr-js/core@latest`, `npm view @dr-js/dev@latest`
      [ 'https://registry.npmjs.org/npm/-/npm-6.14.16.tgz', 'LMiLGYsVNJfVPlQg7v2NYjG7iRIapcLv+oMunlq7fkXVx0BATCjRu7XyWl0G+iuZzHy4CjtM32QB8ox8juTgaw==:sha512:base64' ],
      [ 'https://registry.npmjs.org/@min-pack/npm/-/npm-0.1.4.tgz', 'mFe5PkBTQcxxSkh+ZZ2VS9gymcglVGu++mvXpeszwYyQtDnK7uiQ4BBNihxIppmfRLES9awtM7rHUEvti4r0Pg==:sha512:base64', 'min-pack-npm-###.tgz' ], // NOTE: fix filename
      [ 'https://registry.npmjs.org/@dr-js/core/-/core-0.4.25.tgz', 'FAv/bogaBeRZCCoBNoXwPQafoNEraaSfTJMdx/+O7yk8Heo5wrJ0ybLrbfCdJRBWTpYdkZ3lPg7XhooQEoN5sA==:sha512:base64', 'dr-js-###.tgz' ], // NOTE: fix filename
      [ 'https://registry.npmjs.org/@dr-js/dev/-/dev-0.4.31.tgz', '/MplBO0PKLsMHrYWpRQhUwnQilJQGMjqlHT6F8FRKg7OZFiqYx7xAyvI3BBTL84dtmMSD0CGEIaq5tkTf8YAYQ==:sha512:base64', 'dr-dev-###.tgz' ] // NOTE: fix filename
    ]
    const RES_FLAVOR_BIN_NGINX = [
      // update at 2021/11/26, to find download from: https://nginx.org/en/download.html
      // and: https://github.com/google/ngx_brotli
      [ 'https://nginx.org/download/nginx-1.20.2.tar.gz', '958876757782190a1653e14dc26dfc7ba263de310e04c113e11e97d1bef45a42' ], // TODO: need to calc hash yourself
      [ 'https://github.com/google/brotli/archive/e61745a6.zip', '4a79fd9fd30bae4d08dab373326cfb21ab0d6b50e0e55564043e35dde7210219', 'brotli.zip' ], // specify filename // TODO: need to calc hash yourself
      [ 'https://github.com/google/ngx_brotli/archive/9aec15e2.zip', '9ec37453ef1a4866590e96bc8df41657382281afcdcc0d368947544e9950d8f9', 'ngx-brotli.zip' ] // specify filename // TODO: need to calc hash yourself
    ]
    const RES_FLAVOR_GO = [
      // update at 2022/02/23, to find download from: https://go.dev/dl/
      [ 'https://go.dev/dl/go1.17.7.linux-amd64.tar.gz', '02b111284bedbfa35a7e5b74a06082d18632eff824fd144312f6063943d49259' ],
      [ 'https://go.dev/dl/go1.17.7.linux-arm64.tar.gz', 'a5aa1ed17d45ee1d58b4a4099b12f8942acbd1dd09b2e9a6abb1c4898043c5f5' ]
    ]
    // update at 2021/11/26, to find download from: https://www.ruby-lang.org/en/downloads/releases/
    const TGZ_RUBY = [ 'https://cache.ruby-lang.org/pub/ruby/2.7/ruby-2.7.5.tar.gz', '2755b900a21235b443bb16dadd9032f784d4a88f143d852bc5d154f22b8781f1' ]

    await resetDirectory(kit.fromOutput(PATH_BUILD, 'build-layer-resource/'))
    for (const [ text, file ] of [
      // update at 2021/10/13, check version at: https://github.com/puppeteer/puppeteer/releases
      BUILD_FLAVOR === DEBIAN11_BUILD_FLAVOR_MAP.FLAVOR_NODE_PUPPETEER10 && [ '10.4.0', 'PUPPETEER_VERSION.txt' ],
      // update at 2022/02/23, check version at: https://github.com/puppeteer/puppeteer/releases
      BUILD_FLAVOR === DEBIAN11_BUILD_FLAVOR_MAP.FLAVOR_NODE_PUPPETEER13 && [ '13.4.0', 'PUPPETEER_VERSION.txt' ],
      // update at 2022/02/23, check version at: https://rubygems.org/pages/download
      BUILD_FLAVOR === DEBIAN11_BUILD_FLAVOR_MAP.FLAVOR_RUBY && [ '3.3.7', 'GEM_VERSION.txt' ]
    ].filter(Boolean)) await writeText(kit.fromOutput(PATH_BUILD, 'build-layer-resource/', file), text)
    await fetchFileListWithLocalCache([
      ...(BUILD_FLAVOR === DEBIAN11_BUILD_FLAVOR_MAP.FLAVOR_NODE ? RES_FLAVOR_NODE : []),
      ...(BUILD_FLAVOR === DEBIAN11_BUILD_FLAVOR_MAP.FLAVOR_BIN_NGINX ? RES_FLAVOR_BIN_NGINX : []),
      ...(BUILD_FLAVOR === DEBIAN11_BUILD_FLAVOR_MAP.FLAVOR_GO ? RES_FLAVOR_GO : []),
      ...(BUILD_FLAVOR === DEBIAN11_BUILD_FLAVOR_MAP.FLAVOR_RUBY ? [ TGZ_RUBY ] : [])
    ], {
      pathOutput: kit.fromOutput(PATH_BUILD, 'build-layer-resource/'),
      pathCache: kit.fromTemp('debian11', 'layer-url')
    })
  }

  for (const DOCKER_BUILD_ARCH_INFO of DOCKER_BUILD_ARCH_INFO_LIST) {
    if (DOCKER_BUILD_ARCH_INFO.node !== process.arch) continue
    kit.padLog(`build image for ${DOCKER_BUILD_ARCH_INFO.key}`)

    const PATH_LOG = kit.fromOutput('debian11-layer', `${BUILD_FLAVOR.NAME}${DOCKER_BUILD_MIRROR}.${DOCKER_BUILD_ARCH_INFO.key}.log`) // leave less file around
    kit.log('PATH_LOG:', PATH_LOG)

    await runDockerWithTee([
      'image', 'build',
      `--tag=${getFlavoredImageTag(BUILD_FLAVOR.NAME)}-${DOCKER_BUILD_ARCH_INFO.key}`,
      `--tag=${getFlavoredImageTag(BUILD_FLAVOR.NAME, TAG_LAYER_CACHE)}-${DOCKER_BUILD_ARCH_INFO.key}`, // NOTE: for layer to use as base, so version-bump won't change Dockerfile
      `--cache-from=${[ ...new Set([ // cache tag
        `${getFlavoredImageTag(BUILD_FLAVOR.NAME, TAG_LAYER_CACHE)}-${DOCKER_BUILD_ARCH_INFO.key}`, // try same label first
        `${getFlavoredImageTag(BUILD_FLAVOR.NAME, TAG_LAYER_MAIN_CACHE)}-${DOCKER_BUILD_ARCH_INFO.key}` // try `main` next
      ]) ].join(',')}`, // https://github.com/moby/moby/issues/34715#issuecomment-425933774
      '--build-arg=BUILDKIT_INLINE_CACHE=1', // save build cache metadata // https://docs.docker.com/engine/reference/commandline/build/#specifying-external-cache-sources
      `--file=./Dockerfile.${DOCKER_BUILD_ARCH_INFO.key}`,
      `--platform=${DOCKER_BUILD_ARCH_INFO.docker}`,
      '--progress=plain', // https://docs.docker.com/develop/develop-images/build_enhancements/#new-docker-build-command-line-build-output
      '.' // context is always CWD
    ], { cwd: PATH_BUILD }, PATH_LOG)
  }
}, { title: `build-${BUILD_FLAVOR_NAME}${DOCKER_BUILD_MIRROR && `-${DOCKER_BUILD_MIRROR}`}` })

const getLayerDockerfileString = ({
  DOCKER_BUILD_ARCH_INFO, BUILD_FLAVOR, getFlavoredImageTag
}) => !BUILD_FLAVOR.LAYER_DEP_BUILD_SCRIPT
  ? `# syntax = ${BUILDKIT_SYNTAX}
FROM ${getFlavoredImageTag(BUILD_FLAVOR.BASE_IMAGE, TAG_LAYER_CACHE)}-${DOCKER_BUILD_ARCH_INFO.key}
RUN \\
  --mount=type=cache,id=${DOCKER_BUILD_ARCH_INFO.key}-core-cache-0,target=/var/log \\
  --mount=type=cache,id=${DOCKER_BUILD_ARCH_INFO.key}-core-cache-1,target=/var/cache \\
  --mount=type=cache,id=${DOCKER_BUILD_ARCH_INFO.key}-core-cache-2,target=/var/lib/apt \\
  --mount=type=bind,target=/mnt/,source=. \\
    cd /mnt/build-layer-script/ \\
 && . ${BUILD_FLAVOR.LAYER_SCRIPT}
`
  : `# syntax = ${BUILDKIT_SYNTAX}
FROM ${getFlavoredImageTag(DEBIAN11_BUILD_FLAVOR_MAP.FLAVOR_DEP_BUILD.NAME, TAG_LAYER_CACHE)}-${DOCKER_BUILD_ARCH_INFO.key} AS dep-build-layer
RUN \\
  --mount=type=cache,id=${DOCKER_BUILD_ARCH_INFO.key}-core-cache-0,target=/var/log \\
  --mount=type=cache,id=${DOCKER_BUILD_ARCH_INFO.key}-core-cache-1,target=/var/cache \\
  --mount=type=cache,id=${DOCKER_BUILD_ARCH_INFO.key}-core-cache-2,target=/var/lib/apt \\
  --mount=type=bind,target=/mnt/,source=. \\
    cd /mnt/build-layer-script/ \\
 && . ${BUILD_FLAVOR.LAYER_DEP_BUILD_SCRIPT}
FROM ${getFlavoredImageTag(BUILD_FLAVOR.BASE_IMAGE, TAG_LAYER_CACHE)}-${DOCKER_BUILD_ARCH_INFO.key} AS check-layer
COPY --from=dep-build-layer ${BUILD_FLAVOR.DEP_BUILD_COPY} ${BUILD_FLAVOR.DEP_BUILD_COPY}
RUN \\
  --mount=type=bind,target=/mnt/,source=. \\
    cd /mnt/build-layer-script/ \\
 && . ${BUILD_FLAVOR.LAYER_SCRIPT}
FROM ${getFlavoredImageTag(BUILD_FLAVOR.BASE_IMAGE, TAG_LAYER_CACHE)}-${DOCKER_BUILD_ARCH_INFO.key}
COPY --from=check-layer ${BUILD_FLAVOR.DEP_BUILD_COPY} ${BUILD_FLAVOR.DEP_BUILD_COPY}
`
