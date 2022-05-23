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
    BUILD_FLAVOR === DEBIAN11_BUILD_FLAVOR_MAP.FLAVOR_RUBY3 && '0-3-base-ruby.sh',
    BUILD_FLAVOR.LAYER_SCRIPT,
    BUILD_FLAVOR.LAYER_DEP_BUILD_SCRIPT
  ].filter(Boolean)) await modifyCopy(kit.fromRoot(__dirname, 'build-layer-script/', file), kit.fromOutput(PATH_BUILD, 'build-layer-script/', file))

  kit.padLog('assemble "build-layer-resource/"')
  {
    const RES_FLAVOR_NODE = [
      // update at 2022/05/23, to find download:
      // - https://deb.nodesource.com/node_16.x/dists/bullseye/main/binary-amd64/Packages
      // - https://deb.nodesource.com/node_16.x/dists/bullseye/main/binary-arm64/Packages
      [ 'https://deb.nodesource.com/node_16.x/pool/main/n/nodejs/nodejs_16.15.0-deb-1nodesource1_amd64.deb', '4f0ea439062ce2d33796e898866780e2745de6a4fd9aa6ce4f7396610a56b0fc' ],
      [ 'https://deb.nodesource.com/node_16.x/pool/main/n/nodejs/nodejs_16.15.0-deb-1nodesource1_arm64.deb', '52e66f46211d66a048ede0c3acfc9838d79aa72293d6559f63d9b667699107af' ],
      // update at 2022/05/23, to find download from: `npm view npm@latest`, `npm view @dr-js/core@latest`, `npm view @dr-js/dev@latest`
      [ 'https://registry.npmjs.org/npm/-/npm-8.10.0.tgz', '6oo65q9Quv9mRPGZJufmSH+C/UFdgelwzRXiglT/2mDB50zdy/lZK5dFY0TJ9fJ/8gHqnxcX1NM206KLjTBMlQ==:sha512:base64' ],
      [ 'https://registry.npmjs.org/@dr-js/core/-/core-0.4.32.tgz', 'jgphHkzilWIF0x54qNVTPPBxtWOfLsmR+kQC67jAcsyWA1rBxi/PakWXEnKrfgHEZGcLJ+BCh7eLvzWZd6fiYg==:sha512:base64', 'dr-js-@@@.tgz' ], // NOTE: fix filename
      [ 'https://registry.npmjs.org/@dr-js/dev/-/dev-0.4.36.tgz', '++xleygih/mumwi4Eu9vAomOdkLOp5c5BbDmxCii+n+Z/XIeuN5SCk6BnxiA1+1MhWPBT2LFRBtpJuN2UV59Ew==:sha512:base64', 'dr-dev-@@@.tgz' ] // NOTE: fix filename
    ]
    const RES_FLAVOR_BIN_NGINX = [
      // update at 2021/11/26, to find download from: https://nginx.org/en/download.html
      // and: https://github.com/google/ngx_brotli
      [ 'https://nginx.org/download/nginx-1.20.2.tar.gz', '958876757782190a1653e14dc26dfc7ba263de310e04c113e11e97d1bef45a42' ], // TODO: need to calc hash yourself
      [ 'https://github.com/google/brotli/archive/e61745a6.zip', '4a79fd9fd30bae4d08dab373326cfb21ab0d6b50e0e55564043e35dde7210219', 'brotli.zip' ], // specify filename // TODO: need to calc hash yourself
      [ 'https://github.com/google/ngx_brotli/archive/9aec15e2.zip', '9ec37453ef1a4866590e96bc8df41657382281afcdcc0d368947544e9950d8f9', 'ngx-brotli.zip' ] // specify filename // TODO: need to calc hash yourself
    ]
    const RES_FLAVOR_GO = [
      // update at 2022/05/23, to find download from: https://go.dev/dl/
      [ 'https://go.dev/dl/go1.18.2.linux-amd64.tar.gz', 'e54bec97a1a5d230fc2f9ad0880fcbabb5888f30ed9666eca4a91c5a32e86cbc' ],
      [ 'https://go.dev/dl/go1.18.2.linux-arm64.tar.gz', 'fc4ad28d0501eaa9c9d6190de3888c9d44d8b5fb02183ce4ae93713f67b8a35b' ]
    ]
    // update at 2022/04/21, to find download from: https://www.ruby-lang.org/en/downloads/releases/
    const TGZ_RUBY = [ 'https://cache.ruby-lang.org/pub/ruby/2.7/ruby-2.7.6.tar.gz', 'e7203b0cc09442ed2c08936d483f8ac140ec1c72e37bb5c401646b7866cb5d10' ]
    const TGZ_RUBY3 = [ 'https://cache.ruby-lang.org/pub/ruby/3.1/ruby-3.1.2.tar.gz', '61843112389f02b735428b53bb64cf988ad9fb81858b8248e22e57336f24a83e' ]

    await resetDirectory(kit.fromOutput(PATH_BUILD, 'build-layer-resource/'))
    for (const [ text, file ] of [
      // update at 2022/05/23, check version at: https://github.com/puppeteer/puppeteer/releases
      BUILD_FLAVOR === DEBIAN11_BUILD_FLAVOR_MAP.FLAVOR_NODE_PUPPETEER13 && [ '14.1.1', 'PUPPETEER_VERSION.txt' ],
      // update at 2022/05/23, check version at: https://rubygems.org/pages/download
      BUILD_FLAVOR === DEBIAN11_BUILD_FLAVOR_MAP.FLAVOR_RUBY && [ '3.3.14', 'GEM_VERSION.txt' ],
      BUILD_FLAVOR === DEBIAN11_BUILD_FLAVOR_MAP.FLAVOR_RUBY3 && [ '3.3.14', 'GEM_VERSION.txt' ]
    ].filter(Boolean)) await writeText(kit.fromOutput(PATH_BUILD, 'build-layer-resource/', file), text)
    await fetchFileListWithLocalCache([
      ...(BUILD_FLAVOR === DEBIAN11_BUILD_FLAVOR_MAP.FLAVOR_NODE ? RES_FLAVOR_NODE : []),
      ...(BUILD_FLAVOR === DEBIAN11_BUILD_FLAVOR_MAP.FLAVOR_BIN_NGINX ? RES_FLAVOR_BIN_NGINX : []),
      ...(BUILD_FLAVOR === DEBIAN11_BUILD_FLAVOR_MAP.FLAVOR_GO ? RES_FLAVOR_GO : []),
      ...(BUILD_FLAVOR === DEBIAN11_BUILD_FLAVOR_MAP.FLAVOR_RUBY ? [ TGZ_RUBY ] : []),
      ...(BUILD_FLAVOR === DEBIAN11_BUILD_FLAVOR_MAP.FLAVOR_RUBY3 ? [ TGZ_RUBY3 ] : [])
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
  --mount=type=cache,id=${DOCKER_BUILD_ARCH_INFO.key}-core-cache-3,target=/root \\
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
  --mount=type=cache,id=${DOCKER_BUILD_ARCH_INFO.key}-core-cache-3,target=/root \\
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
