const {
  writeFileSync,
  oneOf, modifyCopy,
  runMain, resetDirectory,
  fromRoot, fromCache, fromOutput,
  toRunDockerConfig, runWithTee,
  fetchFileWithLocalCache,
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

// update at 2020/11/06, to find download from: https://deb.nodesource.com/node_14.x/dists/buster/main/binary-amd64/Packages
// and: https://deb.nodesource.com/node_14.x/pool/main/n/nodejs/
const DEB_NODEJS = [ 'https://deb.nodesource.com/node_14.x/pool/main/n/nodejs/nodejs_14.15.0-1nodesource1_amd64.deb', '98b6d628de6ba6d0df39134b1c226ffac673d47a78bb928ded8a6c5d5aec604c' ]
// update at 2020/11/07, to find download from: https://registry.npmjs.org/npm/latest (under `dist.tarball`)
const TGZ_NPM = [ 'https://registry.npmjs.org/npm/-/npm-6.14.8.tgz', 'HBZVBMYs5blsj94GTeQZel7s9odVuuSUHy1+AlZh7rPVux1os2ashvEGLy/STNK7vUjbrCg5Kq9/GXisJgdf6A==:sha512:base64' ]

runMain(async (logger) => {
  const BUILD_TAG = `10-${BUILD_FLAVOR}-${BUILD_VERSION}${DOCKER_BUILD_MIRROR && `-${DOCKER_BUILD_MIRROR.toLowerCase()}`}`
  const PATH_BUILD = fromOutput('debian', BUILD_TAG)
  const PATH_LOG = fromOutput('debian', `${BUILD_TAG}.log`)

  logger.padLog('build config')
  logger.log('BUILD_TAG:', BUILD_TAG)
  logger.log('PATH_BUILD:', PATH_BUILD)

  logger.padLog('assemble "/" (context)')
  await resetDirectory(PATH_BUILD)
  writeFileSync(fromOutput(PATH_BUILD, 'Dockerfile'), getLayerDockerfileString({ DOCKER_BUILD_MIRROR }))

  logger.padLog('assemble "build-layer-script/"')
  await resetDirectory(fromOutput(PATH_BUILD, 'build-layer-script/'))
  await modifyCopy(fromRoot(__dirname, 'build-layer-script/'), fromOutput(PATH_BUILD, 'build-layer-script/'))

  logger.padLog('assemble "build-layer-node/"')
  await fetchFileWithLocalCache([
    [ ...DEB_NODEJS, fromOutput(PATH_BUILD, 'build-layer-node/') ],
    [ ...TGZ_NPM, fromOutput(PATH_BUILD, 'build-layer-node/') ]
  ], fromCache('debian', '10-layer-url'))

  logger.padLog('build image')
  await runWithTee(PATH_LOG, toRunDockerConfig({
    argList: [
      'image', 'build',
      '--tag', `${BUILD_REPO}:${BUILD_TAG}`,
      '--file', './Dockerfile',
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
