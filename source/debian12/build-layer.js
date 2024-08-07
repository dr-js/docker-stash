const { writeText } = require('@dr-js/core/library/node/fs/File.js')
const { resetDirectory } = require('@dr-js/core/library/node/fs/Directory.js')
const { modifyCopy } = require('@dr-js/core/library/node/fs/Modify.js')
const { runKit } = require('@dr-js/core/library/node/kit.js')

const { runDockerWithTee } = require('@dr-js/dev/library/docker.js')
const { RES_NODE, RES_NGINX, RES_GO, RES_F_BIT_DEB12, RES_RUBY2, RES_RUBY3, PPTR_VER, PPTR_VER_ARM64_DEB12 } = require('../res-list.js')
const {
  BUILDKIT_SYNTAX, DOCKER_BUILD_ARCH_INFO_LIST,
  DEBIAN12_BUILD_FLAVOR_MAP, verifyDebian12BuildArg,
  fetchFileListWithLocalCache,
  TAG_LAYER_CACHE // , TAG_LAYER_MAIN_CACHE
} = require('../function.js')

const [
  , // node
  , // script.js
  BUILD_FLAVOR_NAME = ''
] = process.argv

runKit(async (kit) => {
  const { BUILD_FLAVOR, getFlavoredTag, getFlavoredImageTag } = verifyDebian12BuildArg({ BUILD_FLAVOR_NAME })

  const BUILD_TAG = getFlavoredTag(BUILD_FLAVOR.NAME)
  const PATH_BUILD = kit.fromOutput('debian12-layer', BUILD_FLAVOR.NAME) // leave less file around

  kit.padLog('build config')
  kit.log('BUILD_TAG:', BUILD_TAG)
  kit.log('PATH_BUILD:', PATH_BUILD)

  kit.padLog('assemble "/" (context)')
  await resetDirectory(PATH_BUILD)

  for (const DOCKER_BUILD_ARCH_INFO of DOCKER_BUILD_ARCH_INFO_LIST) {
    const appendCommandList = [
      // Tell Puppeteer to skip installing Chrome: https://github.com/puppeteer/puppeteer/blob/puppeteer-v22.12.0/docs/api/puppeteer.configuration.md
      BUILD_FLAVOR === DEBIAN12_BUILD_FLAVOR_MAP.FLAVOR_NODE_PPTR2208 && 'ENV PUPPETEER_EXECUTABLE_PATH=/media/node-pptr2208-bin',
      // Fix for pptr v22 launch error: https://github.com/puppeteer/puppeteer/issues/11023#issuecomment-1776247197
      BUILD_FLAVOR === DEBIAN12_BUILD_FLAVOR_MAP.FLAVOR_NODE_PPTR2208 && 'ENV XDG_CONFIG_HOME=/tmp/.pptr',
      BUILD_FLAVOR === DEBIAN12_BUILD_FLAVOR_MAP.FLAVOR_NODE_PPTR2208 && 'ENV XDG_CACHE_HOME=/tmp/.pptr'
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
    BUILD_FLAVOR === DEBIAN12_BUILD_FLAVOR_MAP.FLAVOR_RUBY2 && '0-3-base-ruby.sh',
    BUILD_FLAVOR === DEBIAN12_BUILD_FLAVOR_MAP.FLAVOR_RUBY3 && '0-3-base-ruby.sh',
    BUILD_FLAVOR.LAYER_SCRIPT,
    BUILD_FLAVOR.LAYER_DEP_BUILD_SCRIPT
  ].filter(Boolean)) await modifyCopy(kit.fromRoot(__dirname, 'build-layer-script/', file), kit.fromOutput(PATH_BUILD, 'build-layer-script/', file))

  kit.padLog('assemble "build-layer-resource/"')
  await resetDirectory(kit.fromOutput(PATH_BUILD, 'build-layer-resource/'))
  for (const [ text, file ] of [
    BUILD_FLAVOR === DEBIAN12_BUILD_FLAVOR_MAP.FLAVOR_NODE_PPTR2208 && [ PPTR_VER, 'PUPPETEER_VERSION.txt' ],
    BUILD_FLAVOR === DEBIAN12_BUILD_FLAVOR_MAP.FLAVOR_NODE_PPTR2208 && [ PPTR_VER_ARM64_DEB12, 'PUPPETEER_VERSION_ARM64.txt' ]
  ].filter(Boolean)) await writeText(kit.fromOutput(PATH_BUILD, 'build-layer-resource/', file), text)
  await fetchFileListWithLocalCache([
    ...(BUILD_FLAVOR === DEBIAN12_BUILD_FLAVOR_MAP.FLAVOR_NODE ? RES_NODE : []),
    ...(BUILD_FLAVOR === DEBIAN12_BUILD_FLAVOR_MAP.FLAVOR_BIN_NGINX ? RES_NGINX : []),
    ...(BUILD_FLAVOR === DEBIAN12_BUILD_FLAVOR_MAP.FLAVOR_FLUENT_BIT ? RES_F_BIT_DEB12 : []),
    ...(BUILD_FLAVOR === DEBIAN12_BUILD_FLAVOR_MAP.FLAVOR_RUBY2 ? RES_RUBY2 : []),
    ...(BUILD_FLAVOR === DEBIAN12_BUILD_FLAVOR_MAP.FLAVOR_RUBY2_GO ? RES_GO : []),
    ...(BUILD_FLAVOR === DEBIAN12_BUILD_FLAVOR_MAP.FLAVOR_RUBY3 ? RES_RUBY3 : []),
    ...(BUILD_FLAVOR === DEBIAN12_BUILD_FLAVOR_MAP.FLAVOR_RUBY3_GO ? RES_GO : [])
  ], {
    pathOutput: kit.fromOutput(PATH_BUILD, 'build-layer-resource/'),
    pathCache: kit.fromTemp('debian12', 'layer-url')
  })

  for (const DOCKER_BUILD_ARCH_INFO of DOCKER_BUILD_ARCH_INFO_LIST) {
    if (DOCKER_BUILD_ARCH_INFO.node !== process.arch) continue
    kit.padLog(`build image for ${DOCKER_BUILD_ARCH_INFO.key}`)

    const PATH_LOG = kit.fromOutput('debian12-layer', `${BUILD_FLAVOR.NAME}.${DOCKER_BUILD_ARCH_INFO.key}.log`) // leave less file around
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
