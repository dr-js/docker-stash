const { writeFileAsync } = require('dr-js/library/node/file/function')
const { createDirectory } = require('dr-js/library/node/file/File')
const { modify } = require('dr-js/library/node/file/Modify')
const { runMain } = require('dr-dev/library/main')
const {
  fromRoot, fromCache, fromOutput,
  COMMAND_DOCKER,  runWithTee, fetchGitHubBufferListWithLocalCache
} = require('../function')

const { version: BUILD_VERSION } = require(fromRoot('package.json'))
const BUILD_REPO = require('./BUILD_REPO.json')

const URL_HASH = 'https://api.github.com/repos/tianon/docker-brew-ubuntu-core/git/refs/heads/dist-amd64' // branch info
const URL_DOCKERFILE = 'https://github.com/tianon/docker-brew-ubuntu-core/raw/dist-amd64/bionic/Dockerfile'
const URL_UBUNTU_CORE_IMAGE = 'https://github.com/tianon/docker-brew-ubuntu-core/raw/dist-amd64/bionic/ubuntu-bionic-core-cloudimg-amd64-root.tar.gz' // or: https://partner-images.canonical.com/core/bionic/current/ubuntu-bionic-core-cloudimg-amd64-root.tar.gz

runMain(async (logger) => {
  const BUILD_FLAVOR = 'core'
  const BUILD_TAG = `${BUILD_VERSION}-1804-${BUILD_FLAVOR}`
  const PATH_BUILD = fromOutput(BUILD_TAG)

  logger.padLog('build config')
  logger.log('BUILD_TAG:', BUILD_TAG)
  logger.log('PATH_BUILD:', PATH_BUILD)

  logger.padLog('borrow file form github:tianon/docker-brew-ubuntu-core')
  const [ dockerfileBuffer, ubuntuCoreImageBuffer ] = await fetchGitHubBufferListWithLocalCache([ URL_DOCKERFILE, URL_UBUNTU_CORE_IMAGE ], URL_HASH, fromCache(`1804-${BUILD_FLAVOR}`))

  logger.padLog('assemble build directory (context)')
  await modify.delete(PATH_BUILD).catch(() => {})
  await createDirectory(PATH_BUILD)
  await writeFileAsync(fromOutput(PATH_BUILD, 'Dockerfile'), Buffer.concat([ dockerfileBuffer, Buffer.from(extraDockerfileString) ])) // concat Dockerfile config
  await writeFileAsync(fromOutput(PATH_BUILD, 'ubuntu-bionic-core-cloudimg-amd64-root.tar.gz'), ubuntuCoreImageBuffer)

  logger.padLog('build image')
  await runWithTee(fromOutput(PATH_BUILD, `build.log`), {
    command: COMMAND_DOCKER,
    argList: [
      'image', 'build',
      '--tag', `${BUILD_REPO}:${BUILD_TAG}`,
      '--file', 'Dockerfile',
      '--squash', // merge layer
      '.' // context is always CWD
    ],
    option: { cwd: PATH_BUILD }
  })
}, 'build-core')

const extraDockerfileString = `
# extra command to append

SHELL [ "/bin/bash", "-c" ]

RUN set -ex

RUN apt-get update -yq

# add cs for https
RUN apt-get install -yq --no-install-recommends \\
  ca-certificates

RUN apt-get autoremove -yq --purge \\
  -o APT::AutoRemove::RecommendsImportant=false

# reset dpkg file filter # https://askubuntu.com/a/628410
RUN echo '# dpkg file filter'                                 > /etc/dpkg/dpkg.cfg.d/excludes
RUN echo 'path-exclude=/usr/share/man/*'                      >> /etc/dpkg/dpkg.cfg.d/excludes
RUN echo 'path-exclude=/usr/share/locale/*/LC_MESSAGES/*.mo'  >> /etc/dpkg/dpkg.cfg.d/excludes
RUN echo 'path-exclude=/usr/share/info/*'                     >> /etc/dpkg/dpkg.cfg.d/excludes
RUN echo 'path-exclude=/usr/share/doc/*'                      >> /etc/dpkg/dpkg.cfg.d/excludes
RUN echo 'path-include=/usr/share/doc/*/copyright'            >> /etc/dpkg/dpkg.cfg.d/excludes

# clear left over files
RUN shopt -s nullglob \\
  && find /var/cache/apt/archives /var/lib/apt/lists /var/log /var/lib/dpkg/*-old /var/cache/debconf/*-old -not -name lock -type f -delete \\
  && rm -rf /usr/share/man/* \\
  && rm -rf /usr/share/info/* \\
  && find /usr/share/doc -not -name copyright -type f -delete \\
  && find /usr/share/doc -not -name copyright -type l -delete \\
  && find /usr/share/doc -type d -empty -delete \\
  && shopt -u nullglob
`
