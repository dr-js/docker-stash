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

  logger.padLog('assemble "build-script/"')
  await resetDirectory(fromOutput(PATH_BUILD, 'build-script/'))
  await modifyCopy(fromRoot(__dirname, 'build-script/'), fromOutput(PATH_BUILD, 'build-script/'))

  logger.padLog('assemble "build-deb-node/"')
  await resetDirectory(fromOutput(PATH_BUILD, 'build-deb-node/'))
  const [ debNodejs ] = await fetchUrlWithLocalCache([ URL_DEB_NODEJS ], fromCache('debian', `10-layer-deb`))
  writeFileSync(fromOutput(PATH_BUILD, 'build-deb-node/', URL_DEB_NODEJS.split('/').pop()), debNodejs)

  logger.padLog('build image')
  await runWithTee(PATH_LOG, toRunDockerConfig({
    argList: [
      'image', 'build',
      '--tag', `${BUILD_REPO}:${BUILD_TAG}`,
      '--file', 'Dockerfile',
      '.' // context is always CWD
    ],
    option: { cwd: PATH_BUILD }
  }))
}, `build-${BUILD_FLAVOR}${DOCKER_BUILD_MIRROR && `-${DOCKER_BUILD_MIRROR}`}`)

const getLayerDockerfileString = ({
  DOCKER_BUILD_MIRROR = '', // TODO: for most build, move the ENV to last line and reuse most non-CN layer? but this will be slow when actually build in CN

  isBinCommonLayer = false,
  isBinGitLayer = false,

  mask0 = isBinCommonLayer ? '' : '# ',
  mask1 = mask0 || (isBinGitLayer ? '' : '# ')
}) => `
FROM ${loadTagCore(__dirname, DOCKER_BUILD_MIRROR)}

LABEL arg.DOCKER_BUILD_MIRROR=${JSON.stringify(DOCKER_BUILD_MIRROR)}
ENV DOCKER_BUILD_MIRROR=${JSON.stringify(DOCKER_BUILD_MIRROR)}

# set build path
WORKDIR /root/.build-script/

COPY ./build-script/0-0-base.sh ./
COPY ./build-script/0-1-base-apt.sh ./
COPY ./build-script/0-2-base-node.sh ./

COPY ./build-script/1-0-node-install.sh ./
COPY ./build-deb-node/ ./build-deb-node/
RUN               ./1-0-node-install.sh

${mask0}COPY ./build-script/5-0-bin-common.sh ./
${mask0}RUN               ./5-0-bin-common.sh

${mask1}COPY ./build-script/5-1-bin-git.sh ./
${mask1}RUN               ./5-1-bin-git.sh

# restore path
WORKDIR /root/
`
