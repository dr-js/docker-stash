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
    /^j?ruby/.test(BUILD_FLAVOR.NAME) && '0-3-base-ruby.sh',
    BUILD_FLAVOR.LAYER_SCRIPT,
    BUILD_FLAVOR.LAYER_DEP_BUILD_SCRIPT
  ].filter(Boolean)) await modifyCopy(kit.fromRoot(__dirname, 'build-layer-script/', file), kit.fromOutput(PATH_BUILD, 'build-layer-script/', file))

  kit.padLog('assemble "build-layer-resource/"')
  {
    const RES_FLAVOR_NODE = [
      // update at 2021/10/22, to find download:
      // - https://deb.nodesource.com/node_16.x/dists/bullseye/main/binary-amd64/Packages
      // - https://deb.nodesource.com/node_16.x/dists/bullseye/main/binary-arm64/Packages
      [ 'https://deb.nodesource.com/node_16.x/pool/main/n/nodejs/nodejs_16.12.0-deb-1nodesource1_amd64.deb', '53ec0b087e744a8f426450bbe5cf8fe320c3db228d7b9bd30cd10e2a711ae692' ],
      [ 'https://deb.nodesource.com/node_16.x/pool/main/n/nodejs/nodejs_16.12.0-deb-1nodesource1_arm64.deb', 'bf639d9ea3fb15c76086a9e9f8813d7b7659fcc6f318ad3e192cbea346f463f5' ],
      // update at 2020/10/22, to find download from: `npm view npm@latest-6`, `npm view @dr-js/core@latest`, `npm view @dr-js/dev@latest`
      [ 'https://registry.npmjs.org/npm/-/npm-6.14.15.tgz', 'dkcQc4n+DiJAMYG2haNAMyJbmuvevjXz+WC9dCUzodw8EovwTIc6CATSsTEplCY6c0jG4OshxFGFJsrnKJguWA==:sha512:base64' ],
      [ 'https://registry.npmjs.org/@dr-js/core/-/core-0.4.21.tgz', 'EkodS/M0h3wGt70LBShb5GHR1xtH2XqZ6iNLJ94O+nfZ5MJzG+PY6UR1hU6aE/0+eU2nRtnhu1sGfcoHne8r1g==:sha512:base64', 'dr-js-###.tgz' ], // NOTE: fix filename
      [ 'https://registry.npmjs.org/@dr-js/dev/-/dev-0.4.24.tgz', '/r7pkshosf5iJcHcfDrD+k8ecZURzMkzF5zcv+xEFSvn5DlCoVvmMw4zdc0hqWEtFm6y6Mpv3BQZXjFNpzBTJQ==:sha512:base64', 'dr-dev-###.tgz' ] // NOTE: fix filename
    ]
    const RES_FLAVOR_BIN_NGINX = [
      // update at 2021/06/18, to find download from: https://nginx.org/en/download.html
      // and: https://github.com/google/ngx_brotli
      [ 'https://nginx.org/download/nginx-1.20.1.tar.gz', 'e462e11533d5c30baa05df7652160ff5979591d291736cfa5edb9fd2edb48c49' ], // TODO: need to calc hash yourself
      [ 'https://github.com/google/brotli/archive/e61745a6.zip', '4a79fd9fd30bae4d08dab373326cfb21ab0d6b50e0e55564043e35dde7210219', 'brotli.zip' ], // specify filename // TODO: need to calc hash yourself
      [ 'https://github.com/google/ngx_brotli/archive/9aec15e2.zip', '9ec37453ef1a4866590e96bc8df41657382281afcdcc0d368947544e9950d8f9', 'ngx-brotli.zip' ] // specify filename // TODO: need to calc hash yourself
    ]
    const RES_FLAVOR_GO = [
      // update at 2021/10/13, to find download from: https://golang.org/dl/
      [ 'https://golang.org/dl/go1.17.2.linux-amd64.tar.gz', 'f242a9db6a0ad1846de7b6d94d507915d14062660616a61ef7c808a76e4f1676' ],
      [ 'https://golang.org/dl/go1.17.2.linux-arm64.tar.gz', 'a5a43c9cdabdb9f371d56951b14290eba8ce2f9b0db48fb5fc657943984fd4fc' ]
    ]
    // update at 2021/04/23, to find download from: https://www.ruby-lang.org/en/downloads/releases/
    const TGZ_RUBY = [ 'https://cache.ruby-lang.org/pub/ruby/2.7/ruby-2.7.4.tar.gz', '3043099089608859fc8cce7f9fdccaa1f53a462457e3838ec3b25a7d609fbc5b' ]
    // update at 2021/06/18, to find download from: https://www.jruby.org/download or https://github.com/jruby/jruby/releases/
    const TGZ_JRUBY = [ 'https://repo1.maven.org/maven2/org/jruby/jruby-dist/9.2.19.0/jruby-dist-9.2.19.0-bin.tar.gz', '1f74885a2d3fa589fcbeb292a39facf7f86be3eac1ab015e32c65d32acf3f3bf' ]

    await resetDirectory(kit.fromOutput(PATH_BUILD, 'build-layer-resource/'))
    for (const [ text, file ] of [
      // update at 2021/10/13, check version at: https://github.com/puppeteer/puppeteer/releases
      BUILD_FLAVOR === DEBIAN11_BUILD_FLAVOR_MAP.FLAVOR_NODE_PUPPETEER10 && [ '10.4.0', 'PUPPETEER_VERSION.txt' ],
      // update at 2021/10/13, check version at: https://rubygems.org/pages/download
      BUILD_FLAVOR === DEBIAN11_BUILD_FLAVOR_MAP.FLAVOR_RUBY && [ '3.2.29', 'GEM_VERSION.txt' ]
    ].filter(Boolean)) await writeText(kit.fromOutput(PATH_BUILD, 'build-layer-resource/', file), text)
    await fetchFileListWithLocalCache([
      ...(BUILD_FLAVOR === DEBIAN11_BUILD_FLAVOR_MAP.FLAVOR_NODE ? RES_FLAVOR_NODE : []),
      ...(BUILD_FLAVOR === DEBIAN11_BUILD_FLAVOR_MAP.FLAVOR_BIN_NGINX ? RES_FLAVOR_BIN_NGINX : []),
      ...(BUILD_FLAVOR === DEBIAN11_BUILD_FLAVOR_MAP.FLAVOR_GO ? RES_FLAVOR_GO : []),
      ...(BUILD_FLAVOR === DEBIAN11_BUILD_FLAVOR_MAP.FLAVOR_RUBY ? [ TGZ_RUBY ] : []),
      ...(BUILD_FLAVOR === DEBIAN11_BUILD_FLAVOR_MAP.FLAVOR_JRUBY ? [ TGZ_JRUBY ] : [])
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
