const { oneOf } = require('dr-js/library/common/verify')
const { writeFileAsync } = require('dr-js/library/node/file/function')
const { createDirectory } = require('dr-js/library/node/file/File')
const { modify } = require('dr-js/library/node/file/Modify')
const { runMain } = require('dr-dev/library/main')
const {
  fromRoot, fromOutput,
  COMMAND_DOCKER,runWithTee
} = require('../function')

const { version: BUILD_VERSION } = require(fromRoot('package.json'))
const BUILD_REPO = require('./BUILD_REPO.json')

const [
  , // node
  , // script.js
  BUILD_FLAVOR = 'full',
  DOCKER_BUILD_MIRROR = '' // now support "CN" only
] = process.argv

oneOf(BUILD_FLAVOR, [ 'node', 'ruby', 'full' ])
oneOf(DOCKER_BUILD_MIRROR, [ '', 'CN' ])

runMain(async (logger) => {
  const BUILD_TAG = `${BUILD_VERSION}-1804-${BUILD_FLAVOR}${DOCKER_BUILD_MIRROR && `-${DOCKER_BUILD_MIRROR.toLowerCase()}`}`
  const PATH_BUILD = fromOutput(BUILD_TAG)

  logger.padLog('build config')
  logger.log('BUILD_TAG:', BUILD_TAG)
  logger.log('PATH_BUILD:', PATH_BUILD)

  logger.padLog('assemble build directory')
  await modify.delete(PATH_BUILD).catch(() => {})
  await createDirectory(PATH_BUILD)
  await writeFileAsync(fromOutput(PATH_BUILD, 'Dockerfile'), getLayerDockerfileString({
    BUILD_REPO,
    BUILD_VERSION,
    DOCKER_BUILD_MIRROR,
    isNodeLayer: BUILD_FLAVOR === 'node',
    isRubyLayer: BUILD_FLAVOR === 'ruby'
  }))
  await modify.copy(
    fromRoot(__dirname, `build-script/`),
    fromOutput(PATH_BUILD, 'build-script/')
  )

  logger.padLog('build image')
  await runWithTee(fromOutput(PATH_BUILD, `build.log`), {
    command: COMMAND_DOCKER,
    argList: [
      'image', 'build',
      '--tag', `${BUILD_REPO}:${BUILD_TAG}`,
      '--file', 'Dockerfile',
      '.' // context is always CWD
    ],
    option: { cwd: PATH_BUILD }
  })
}, `build-${BUILD_FLAVOR}${DOCKER_BUILD_MIRROR && `-${DOCKER_BUILD_MIRROR}`}`)

const getLayerDockerfileString = ({
  BUILD_REPO,
  BUILD_VERSION,
  DOCKER_BUILD_MIRROR = '',

  isNodeLayer = false,
  isRubyLayer = false,

  mask0 = isNodeLayer ? '# ' : '',
  mask1 = mask0 || isRubyLayer ? '# ' : ''
}) => `
FROM ${BUILD_REPO}:${BUILD_VERSION}-1804-core

LABEL arg.DOCKER_BUILD_MIRROR=${JSON.stringify(DOCKER_BUILD_MIRROR)}
ENV DOCKER_BUILD_MIRROR=${JSON.stringify(DOCKER_BUILD_MIRROR)}

# set build path
WORKDIR /root/.build-script/

COPY ./build-script/0-0-base.sh ./

COPY ./build-script/1-0-apt-setup.sh ./
RUN ./1-0-apt-setup.sh

COPY ./build-script/2-0-node-base.sh ./
COPY ./build-script/2-1-node-install.sh ./
RUN ./2-1-node-install.sh

${mask0}COPY ./build-script/3-0-ruby-base.sh ./
${mask0}COPY ./build-script/3-1-ruby-install-jemelloc.sh ./
${mask0}RUN ./3-1-ruby-install-jemelloc.sh

${mask1}COPY ./build-script/9-0-git.sh ./
${mask1}RUN ./9-0-git.sh

${mask1}COPY ./build-script/9-1-ssh.sh ./
${mask1}RUN ./9-1-ssh.sh

${mask1}COPY ./build-script/9-2-7z.sh ./
${mask1}RUN ./9-2-7z.sh

${mask1}COPY ./build-script/9-3-puppeteer-dep.sh ./
${mask1}RUN ./9-3-puppeteer-dep.sh

# restore path
WORKDIR /root/
`
