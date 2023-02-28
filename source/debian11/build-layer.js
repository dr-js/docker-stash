const { writeText } = require('@dr-js/core/library/node/fs/File.js')
const { resetDirectory } = require('@dr-js/core/library/node/fs/Directory.js')
const { modifyCopy } = require('@dr-js/core/library/node/fs/Modify.js')
const { runKit } = require('@dr-js/core/library/node/kit.js')

const { runDockerWithTee } = require('@dr-js/dev/library/docker.js')
const {
  BUILDKIT_SYNTAX, DOCKER_BUILD_ARCH_INFO_LIST,
  DEBIAN11_BUILD_FLAVOR_MAP, verifyDebian11BuildArg,
  fetchFileListWithLocalCache,
  TAG_LAYER_CACHE // , TAG_LAYER_MAIN_CACHE
} = require('../function.js')

const [
  , // node
  , // script.js
  BUILD_FLAVOR_NAME = ''
] = process.argv

runKit(async (kit) => {
  const { BUILD_FLAVOR, getFlavoredTag, getFlavoredImageTag } = verifyDebian11BuildArg({ BUILD_FLAVOR_NAME })

  const BUILD_TAG = getFlavoredTag(BUILD_FLAVOR.NAME)
  const PATH_BUILD = kit.fromOutput('debian11-layer', BUILD_FLAVOR.NAME) // leave less file around

  kit.padLog('build config')
  kit.log('BUILD_TAG:', BUILD_TAG)
  kit.log('PATH_BUILD:', PATH_BUILD)

  kit.padLog('assemble "/" (context)')
  await resetDirectory(PATH_BUILD)

  for (const DOCKER_BUILD_ARCH_INFO of DOCKER_BUILD_ARCH_INFO_LIST) {
    const appendCommandList = [
      BUILD_FLAVOR === DEBIAN11_BUILD_FLAVOR_MAP.FLAVOR_NODE_PPTR2206 && 'ENV PUPPETEER_EXECUTABLE_PATH=/media/node-pptr2206-bin'
    ].filter(Boolean)
    await writeText(
      kit.fromOutput(PATH_BUILD, `Dockerfile.${DOCKER_BUILD_ARCH_INFO.key}`),
      getLayerDockerfileString({ DOCKER_BUILD_ARCH_INFO, BUILD_FLAVOR, appendCommandList, getFlavoredImageTag })
    )
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
      // update at 2023/02/28, to find download:
      // - https://deb.nodesource.com/node_18.x/dists/bullseye/main/binary-amd64/Packages
      // - https://deb.nodesource.com/node_18.x/dists/bullseye/main/binary-arm64/Packages
      [ 'https://deb.nodesource.com/node_18.x/pool/main/n/nodejs/nodejs_18.14.2-deb-1nodesource1_amd64.deb', '610d7f2ff37545119792a4924b6be5e5af8bd5782349e3737c9b9207eba13f75' ],
      [ 'https://deb.nodesource.com/node_18.x/pool/main/n/nodejs/nodejs_18.14.2-deb-1nodesource1_arm64.deb', 'd2c11ad79baf0651ba4c4948f81b8a7f79eaccb0527979074b7d3805c6b58e45' ],
      // update at 2023/02/28, to find download from: `npm view npm@8; npm view @dr-js/core@latest; npm view @dr-js/dev@latest`
      [ 'https://registry.npmjs.org/npm/-/npm-8.19.4.tgz', '3HANl8i9DKnUA89P4KEgVNN28EjSeDCmvEqbzOAuxCFDzdBZzjUl99zgnGpOUumvW5lvJo2HKcjrsc+tfyv1Hw==:sha512:base64' ],
      [ 'https://registry.npmjs.org/@dr-js/core/-/core-0.5.7.tgz', 'TW6p1WHxfUa3jmQ9OWY2On3wNk89VQa9FWXcLC9IGZoBvY9autys/zJFPOhLlpBvWnuyoXfFC0UDoJvXh2HQDw==:sha512:base64', 'dr-js-@@@.tgz' ], // NOTE: fix filename
      [ 'https://registry.npmjs.org/@dr-js/dev/-/dev-0.5.6.tgz', 'JInou+hoFFaDvDFcPiFLZL9Lg3inOmrnB23beFL9BkEIgbtZF0+zo/12c65xjuQlmnX6ArEX8AnweKL15PSyLg==:sha512:base64', 'dr-dev-@@@.tgz' ] // NOTE: fix filename
    ]
    const RES_FLAVOR_BIN_NGINX = [
      // update at 2022/11/23, to find download from: https://nginx.org/en/download.html
      // and: https://github.com/google/ngx_brotli
      [ 'https://nginx.org/download/nginx-1.22.1.tar.gz', '9ebb333a9e82b952acd3e2b4aeb1d4ff6406f72491bab6cd9fe69f0dea737f31' ], // TODO: need to calc hash yourself
      [ 'https://github.com/google/brotli/archive/f4153a09.zip', '126fdd3252db2428bf6ced066dd73298dc151d46a0f17f3d050eebe7cd3032ca', 'brotli.zip' ], // specify filename // TODO: need to calc hash yourself
      [ 'https://github.com/google/ngx_brotli/archive/6e975bcb.zip', '62914aceb8cb8c87d09e2879e6de3627d50a7d1bd6a4b1460cb393a3891b684d', 'ngx-brotli.zip' ] // specify filename // TODO: need to calc hash yourself
    ]
    const RES_FLAVOR_GO = [
      // update at 2023/02/28, to find download from: https://go.dev/dl/
      [ 'https://go.dev/dl/go1.20.1.linux-amd64.tar.gz', '000a5b1fca4f75895f78befeb2eecf10bfff3c428597f3f1e69133b63b911b02' ],
      [ 'https://go.dev/dl/go1.20.1.linux-arm64.tar.gz', '5e5e2926733595e6f3c5b5ad1089afac11c1490351855e87849d0e7702b1ec2e' ]
    ]
    // update at 2023/02/28, to find download from: https://www.ruby-lang.org/en/downloads/releases/
    const TGZ_RUBY = [ 'https://cache.ruby-lang.org/pub/ruby/2.7/ruby-2.7.7.tar.gz', 'e10127db691d7ff36402cfe88f418c8d025a3f1eea92044b162dd72f0b8c7b90' ]
    const TGZ_RUBY3 = [ 'https://cache.ruby-lang.org/pub/ruby/3.2/ruby-3.2.1.tar.gz', '13d67901660ee3217dbd9dd56059346bd4212ce64a69c306ef52df64935f8dbd' ]

    await resetDirectory(kit.fromOutput(PATH_BUILD, 'build-layer-resource/'))
    for (const [ text, file ] of [
      // update at 2023/02/28, check version at: https://github.com/puppeteer/puppeteer/releases
      BUILD_FLAVOR === DEBIAN11_BUILD_FLAVOR_MAP.FLAVOR_NODE_PPTR2206 && [ '19.7.2', 'PUPPETEER_VERSION.txt' ],
      BUILD_FLAVOR === DEBIAN11_BUILD_FLAVOR_MAP.FLAVOR_NODE_PPTR2206 && [ '19.3.0', 'PUPPETEER_VERSION_ARM64.txt' ],
      // update at 2023/02/28, check version at: https://rubygems.org/pages/download
      BUILD_FLAVOR === DEBIAN11_BUILD_FLAVOR_MAP.FLAVOR_RUBY && [ '3.4.7', 'GEM_VERSION.txt' ],
      BUILD_FLAVOR === DEBIAN11_BUILD_FLAVOR_MAP.FLAVOR_RUBY3 && [ '3.4.7', 'GEM_VERSION.txt' ]
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

    const PATH_LOG = kit.fromOutput('debian11-layer', `${BUILD_FLAVOR.NAME}.${DOCKER_BUILD_ARCH_INFO.key}.log`) // leave less file around
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
}, { title: `build-${BUILD_FLAVOR_NAME}` })

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
${appendCommandList.join('\n')}`
