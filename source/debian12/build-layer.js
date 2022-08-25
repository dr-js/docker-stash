const { writeText } = require('@dr-js/core/library/node/fs/File.js')
const { resetDirectory } = require('@dr-js/core/library/node/fs/Directory.js')
const { modifyCopy } = require('@dr-js/core/library/node/fs/Modify.js')
const { runKit } = require('@dr-js/core/library/node/kit.js')

const { runDockerWithTee } = require('@dr-js/dev/library/docker.js')
const {
  BUILDKIT_SYNTAX, DOCKER_BUILD_ARCH_INFO_LIST,
  DEBIAN12_BUILD_FLAVOR_MAP, verifyDebian12BuildArg,
  fetchFileListWithLocalCache,
  TAG_LAYER_CACHE // , TAG_LAYER_MAIN_CACHE
} = require('../function.js')

const [
  , // node
  , // script.js
  BUILD_FLAVOR_NAME = '',
  DOCKER_BUILD_MIRROR = '' // now support "CN" only
] = process.argv

runKit(async (kit) => {
  const { BUILD_FLAVOR, getFlavoredTag, getFlavoredImageTag } = verifyDebian12BuildArg({ BUILD_FLAVOR_NAME, DOCKER_BUILD_MIRROR })

  const BUILD_TAG = getFlavoredTag(BUILD_FLAVOR.NAME)
  const PATH_BUILD = kit.fromOutput('debian12-layer', `${BUILD_FLAVOR.NAME}${DOCKER_BUILD_MIRROR}`) // leave less file around

  kit.padLog('build config')
  kit.log('BUILD_TAG:', BUILD_TAG)
  kit.log('PATH_BUILD:', PATH_BUILD)

  kit.padLog('assemble "/" (context)')
  await resetDirectory(PATH_BUILD)

  for (const DOCKER_BUILD_ARCH_INFO of DOCKER_BUILD_ARCH_INFO_LIST) {
    const appendCommandList = [
      DOCKER_BUILD_ARCH_INFO.key === 'arm64' && BUILD_FLAVOR === DEBIAN12_BUILD_FLAVOR_MAP.FLAVOR_NODE_PPTR2208 && 'ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium'
    ].filter(Boolean)
    await writeText(
      kit.fromOutput(PATH_BUILD, `Dockerfile.${DOCKER_BUILD_ARCH_INFO.key}`),
      getLayerDockerfileString({ DOCKER_BUILD_ARCH_INFO, BUILD_FLAVOR, appendCommandList, getFlavoredImageTag })
    )
  }

  for (const DOCKER_BUILD_ARCH_INFO of DOCKER_BUILD_ARCH_INFO_LIST) {
    await writeText(kit.fromOutput(PATH_BUILD, `Dockerfile.${DOCKER_BUILD_ARCH_INFO.key}`), getLayerDockerfileString({ DOCKER_BUILD_ARCH_INFO, BUILD_FLAVOR, getFlavoredImageTag }))
  }

  kit.padLog('assemble "build-layer-script/"')
  await resetDirectory(kit.fromOutput(PATH_BUILD, 'build-layer-script/'))
  for (const file of [
    '0-0-base.sh',
    '0-1-base-apt.sh',
    BUILD_FLAVOR === DEBIAN12_BUILD_FLAVOR_MAP.FLAVOR_RUBY3 && '0-3-base-ruby.sh',
    BUILD_FLAVOR.LAYER_SCRIPT,
    BUILD_FLAVOR.LAYER_DEP_BUILD_SCRIPT
  ].filter(Boolean)) await modifyCopy(kit.fromRoot(__dirname, 'build-layer-script/', file), kit.fromOutput(PATH_BUILD, 'build-layer-script/', file))

  kit.padLog('assemble "build-layer-resource/"')
  {
    const RES_FLAVOR_NODE = [
      // update at 2022/08/25, to find download:
      // - https://deb.nodesource.com/node_18.x/dists/bookworm/main/binary-amd64/Packages
      // - https://deb.nodesource.com/node_18.x/dists/bookworm/main/binary-arm64/Packages
      [ 'https://deb.nodesource.com/node_18.x/pool/main/n/nodejs/nodejs_18.8.0-deb-1nodesource1_amd64.deb', '70fac91c422f2439979cf2e9fdff053907ab8d7eedb26c8be172b8d00241c39a' ],
      [ 'https://deb.nodesource.com/node_18.x/pool/main/n/nodejs/nodejs_18.8.0-deb-1nodesource1_arm64.deb', 'f36f1b9f77795924389cc345953954004444e26a342f9c58030d3af60202e60f' ],
      // update at 2022/08/25, to find download from: `npm view npm@latest; npm view @dr-js/core@latest; npm view @dr-js/dev@latest`
      [ 'https://registry.npmjs.org/npm/-/npm-8.18.0.tgz', 'G07/yKvNUwhwxYhk8BxcuDPB/4s+y755i6CnH3lf9LQBHP5siUx66WbuNGWEnN3xaBER4+IR3OWApKX7eBO5Dw==:sha512:base64' ],
      [ 'https://registry.npmjs.org/@dr-js/core/-/core-0.5.4.tgz', 'USlagAMD2/tWfu1PZx5NlUEHeMJcsr8nsK9m/iilH20zHFxAbQTJOCDe+TrVpOvbkp5Zt5OnuxK/RBsu29c2EA==:sha512:base64', 'dr-js-@@@.tgz' ], // NOTE: fix filename
      [ 'https://registry.npmjs.org/@dr-js/dev/-/dev-0.5.3.tgz', 'E54N5n8eiaqL3RNhYXY5Lh56kvAd3UPJs7TmKHpHJ6zaRbxPW7OVMvTSSoFlbmYgtz2J0QN6iCnlTOLD0np9ew==:sha512:base64', 'dr-dev-@@@.tgz' ] // NOTE: fix filename
    ]
    const RES_FLAVOR_BIN_NGINX = [
      // update at 2022/06/06, to find download from: https://nginx.org/en/download.html
      // and: https://github.com/google/ngx_brotli
      [ 'https://nginx.org/download/nginx-1.22.0.tar.gz', 'b33d569a6f11a01433a57ce17e83935e953ad4dc77cdd4d40f896c88ac26eb53' ], // TODO: need to calc hash yourself
      [ 'https://github.com/google/brotli/archive/f4153a09.zip', '126fdd3252db2428bf6ced066dd73298dc151d46a0f17f3d050eebe7cd3032ca', 'brotli.zip' ], // specify filename // TODO: need to calc hash yourself
      [ 'https://github.com/google/ngx_brotli/archive/6e975bcb.zip', '62914aceb8cb8c87d09e2879e6de3627d50a7d1bd6a4b1460cb393a3891b684d', 'ngx-brotli.zip' ] // specify filename // TODO: need to calc hash yourself
    ]
    const RES_FLAVOR_GO = [
      // update at 2022/08/12, to find download from: https://go.dev/dl/
      [ 'https://go.dev/dl/go1.19.linux-amd64.tar.gz', '464b6b66591f6cf055bc5df90a9750bf5fbc9d038722bb84a9d56a2bea974be6' ],
      [ 'https://go.dev/dl/go1.19.linux-arm64.tar.gz', 'efa97fac9574fc6ef6c9ff3e3758fb85f1439b046573bf434cccb5e012bd00c8' ]
    ]
    // update at 2022/04/21, to find download from: https://www.ruby-lang.org/en/downloads/releases/
    const TGZ_RUBY3 = [ 'https://cache.ruby-lang.org/pub/ruby/3.1/ruby-3.1.2.tar.gz', '61843112389f02b735428b53bb64cf988ad9fb81858b8248e22e57336f24a83e' ]

    await resetDirectory(kit.fromOutput(PATH_BUILD, 'build-layer-resource/'))
    for (const [ text, file ] of [
      // update at 2022/08/25, check version at: https://github.com/puppeteer/puppeteer/releases
      BUILD_FLAVOR === DEBIAN12_BUILD_FLAVOR_MAP.FLAVOR_NODE_PPTR2208 && [ '16.2.0', 'PUPPETEER_VERSION.txt' ],
      BUILD_FLAVOR === DEBIAN12_BUILD_FLAVOR_MAP.FLAVOR_NODE_PPTR2208 && [ '15.4.2', 'PUPPETEER_VERSION_ARM64.txt' ],
      // update at 2022/08/25, check version at: https://rubygems.org/pages/download
      BUILD_FLAVOR === DEBIAN12_BUILD_FLAVOR_MAP.FLAVOR_RUBY3 && [ '3.3.21', 'GEM_VERSION.txt' ]
    ].filter(Boolean)) await writeText(kit.fromOutput(PATH_BUILD, 'build-layer-resource/', file), text)
    await fetchFileListWithLocalCache([
      ...(BUILD_FLAVOR === DEBIAN12_BUILD_FLAVOR_MAP.FLAVOR_NODE ? RES_FLAVOR_NODE : []),
      ...(BUILD_FLAVOR === DEBIAN12_BUILD_FLAVOR_MAP.FLAVOR_BIN_NGINX ? RES_FLAVOR_BIN_NGINX : []),
      ...(BUILD_FLAVOR === DEBIAN12_BUILD_FLAVOR_MAP.FLAVOR_GO ? RES_FLAVOR_GO : []),
      ...(BUILD_FLAVOR === DEBIAN12_BUILD_FLAVOR_MAP.FLAVOR_RUBY3 ? [ TGZ_RUBY3 ] : [])
    ], {
      pathOutput: kit.fromOutput(PATH_BUILD, 'build-layer-resource/'),
      pathCache: kit.fromTemp('debian12', 'layer-url')
    })
  }

  for (const DOCKER_BUILD_ARCH_INFO of DOCKER_BUILD_ARCH_INFO_LIST) {
    if (DOCKER_BUILD_ARCH_INFO.node !== process.arch) continue
    kit.padLog(`build image for ${DOCKER_BUILD_ARCH_INFO.key}`)

    const PATH_LOG = kit.fromOutput('debian12-layer', `${BUILD_FLAVOR.NAME}${DOCKER_BUILD_MIRROR}.${DOCKER_BUILD_ARCH_INFO.key}.log`) // leave less file around
    kit.log('PATH_LOG:', PATH_LOG)

    await runDockerWithTee([
      'image', 'build',
      `--tag=${getFlavoredImageTag(BUILD_FLAVOR.NAME)}-${DOCKER_BUILD_ARCH_INFO.key}`,
      `--tag=${getFlavoredImageTag(BUILD_FLAVOR.NAME, TAG_LAYER_CACHE)}-${DOCKER_BUILD_ARCH_INFO.key}`, // NOTE: for layer to use as base, so version-bump won't change Dockerfile
      // TODO: disable for now. a loop in cache may stack-overflow dockerd (buildkit), possibly related:
      //   https://github.com/moby/buildkit/issues/1902
      //   https://github.com/moby/moby/issues/40993#issuecomment-634259286
      // `--cache-from=${[ ...new Set([ // cache tag
      //   `${getFlavoredImageTag(BUILD_FLAVOR.NAME, TAG_LAYER_CACHE)}-${DOCKER_BUILD_ARCH_INFO.key}`, // try same label first
      //   `${getFlavoredImageTag(BUILD_FLAVOR.NAME, TAG_LAYER_MAIN_CACHE)}-${DOCKER_BUILD_ARCH_INFO.key}` // try `main` next
      // ]) ].join(',')}`, // https://github.com/moby/moby/issues/34715#issuecomment-425933774
      '--build-arg=BUILDKIT_INLINE_CACHE=1', // save build cache metadata // https://docs.docker.com/engine/reference/commandline/build/#specifying-external-cache-sources
      `--file=./Dockerfile.${DOCKER_BUILD_ARCH_INFO.key}`,
      `--platform=${DOCKER_BUILD_ARCH_INFO.docker}`,
      '--progress=plain', // https://docs.docker.com/develop/develop-images/build_enhancements/#new-docker-build-command-line-build-output
      '.' // context is always CWD
    ], { cwd: PATH_BUILD }, PATH_LOG)
  }
}, { title: `build-${BUILD_FLAVOR_NAME}${DOCKER_BUILD_MIRROR && `-${DOCKER_BUILD_MIRROR}`}` })

const getLayerDockerfileString = ({
  DOCKER_BUILD_ARCH_INFO, BUILD_FLAVOR, appendCommandList = [], getFlavoredImageTag
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
${appendCommandList.join('\n')}`
  : `# syntax = ${BUILDKIT_SYNTAX}
FROM ${getFlavoredImageTag(DEBIAN12_BUILD_FLAVOR_MAP.FLAVOR_DEP_BUILD.NAME, TAG_LAYER_CACHE)}-${DOCKER_BUILD_ARCH_INFO.key} AS dep-build-layer
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
${appendCommandList.join('\n')}`
