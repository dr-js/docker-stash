const {
  writeFileSync,
  oneOf, modifyCopy,
  runMain, resetDirectory,
  fromRoot, fromCache, fromOutput,
  toRunDockerConfig, runWithTee,
  fetchUrlWithLocalCache,
  loadTagCore
} = require('../function')

const { version: BUILD_VERSION } = require(fromRoot('package.json'))
const BUILD_REPO = require('./BUILD_REPO.json')
const BUILDKIT_SYNTAX = require('./BUILDKIT_SYNTAX.json')

const [
  , // node
  , // script.js
  BUILD_FLAVOR = 'full',
  DOCKER_BUILD_MIRROR = '' // now support "CN" only
] = process.argv

oneOf(BUILD_FLAVOR, [ 'node', 'bin', 'full' ])
oneOf(DOCKER_BUILD_MIRROR, [ '', 'CN' ])

// update at 2020/11/06, to find download from: https://deb.nodesource.com/node_14.x/pool/main/n/nodejs/
const URL_DEB_NODEJS = 'https://deb.nodesource.com/node_14.x/pool/main/n/nodejs/nodejs_14.15.0-1nodesource1_amd64.deb'
// update at 2020/11/07, to find download from: https://registry.npmjs.org/npm/latest (under `dist.tarball`)
const URL_TGZ_NPM = 'https://registry.npmjs.org/npm/-/npm-6.14.8.tgz'

runMain(async (logger) => {
  const BUILD_TAG = `${BUILD_VERSION}-10-${BUILD_FLAVOR}${DOCKER_BUILD_MIRROR && `-${DOCKER_BUILD_MIRROR.toLowerCase()}`}`
  const PATH_BUILD = fromOutput('debian', BUILD_TAG)
  const PATH_LOG = fromOutput('debian', `${BUILD_TAG}.log`)

  logger.padLog('build config')
  logger.log('BUILD_TAG:', BUILD_TAG)
  logger.log('PATH_BUILD:', PATH_BUILD)

  logger.padLog('assemble "/" (context)')
  await resetDirectory(PATH_BUILD)
  writeFileSync(fromOutput(PATH_BUILD, 'Dockerfile'), getLayerDockerfileString({
    DOCKER_BUILD_MIRROR,
    isBinCommonLayer: BUILD_FLAVOR === 'bin' || BUILD_FLAVOR === 'full',
    isBinGitLayer: BUILD_FLAVOR === 'full'
  }))

  logger.padLog('assemble "build-layer-script/"')
  await resetDirectory(fromOutput(PATH_BUILD, 'build-layer-script/'))
  await modifyCopy(fromRoot(__dirname, 'build-layer-script/'), fromOutput(PATH_BUILD, 'build-layer-script/'))

  logger.padLog('assemble "build-layer-node/"')
  await resetDirectory(fromOutput(PATH_BUILD, 'build-layer-node/'))
  const [ debNodejs, tgzNpm ] = await fetchUrlWithLocalCache([ URL_DEB_NODEJS, URL_TGZ_NPM ], fromCache('debian', '10-layer-url'))
  writeFileSync(fromOutput(PATH_BUILD, 'build-layer-node/', URL_DEB_NODEJS.split('/').pop()), debNodejs)
  writeFileSync(fromOutput(PATH_BUILD, 'build-layer-node/', URL_TGZ_NPM.split('/').pop()), tgzNpm)

  logger.padLog('build image')
  await runWithTee(PATH_LOG, toRunDockerConfig({
    argList: [
      'image', 'build',
      '--tag', `${BUILD_REPO}:${BUILD_TAG}`,
      '--file', 'Dockerfile',
      '--target', `stage-${BUILD_FLAVOR}`,
      '--progress=plain', // https://docs.docker.com/develop/develop-images/build_enhancements/#new-docker-build-command-line-build-output
      '.' // context is always CWD
    ],
    option: { cwd: PATH_BUILD }
  }))
}, `build-${BUILD_FLAVOR}${DOCKER_BUILD_MIRROR && `-${DOCKER_BUILD_MIRROR}`}`)

const getLayerDockerfileString = ({
  DOCKER_BUILD_MIRROR = ''
}) => `# syntax = ${BUILDKIT_SYNTAX}
FROM ${loadTagCore(__dirname, DOCKER_BUILD_MIRROR)} as stage-node
RUN \\
  --mount=type=cache,target=/var/log \\
  --mount=type=cache,target=/var/cache \\
  --mount=type=cache,target=/var/lib/apt \\
  --mount=type=bind,target=/root/.docker-build/,source=. \\
    cd /root/.docker-build/build-layer-script/ \\
 && . 1-0-node-install.sh

FROM stage-node as stage-bin
RUN \\
  --mount=type=cache,target=/var/log \\
  --mount=type=cache,target=/var/cache \\
  --mount=type=cache,target=/var/lib/apt \\
  --mount=type=bind,target=/root/.docker-build/,source=. \\
    cd /root/.docker-build/build-layer-script/ \\
 && . 5-0-bin-common.sh

FROM stage-bin as stage-full
RUN \\
  --mount=type=cache,target=/var/log \\
  --mount=type=cache,target=/var/cache \\
  --mount=type=cache,target=/var/lib/apt \\
  --mount=type=bind,target=/root/.docker-build/,source=. \\
    cd /root/.docker-build/build-layer-script/ \\
 && . 5-1-bin-git.sh
`
