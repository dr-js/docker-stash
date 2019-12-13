const { createHash } = require('crypto')
const { writeFileAsync } = require('@dr-js/core/library/node/file/function')
const { runMain } = require('@dr-js/dev/library/main')
const {
  resetDirectory,
  fromCache, fromOutput,
  COMMAND_DOCKER, runWithTee,
  fetchGitHubBufferListWithLocalCache,
  getIsDockerImageExist, saveTagCoreAsync
} = require('../function')

const BUILD_REPO = require('./BUILD_REPO.json')
const BUILD_FLAVOR = 'core'

const URL_HASH = 'https://api.github.com/repos/tianon/docker-brew-ubuntu-core/git/refs/heads/dist-amd64' // branch info
const URL_DOCKERFILE = 'https://github.com/tianon/docker-brew-ubuntu-core/raw/dist-amd64/bionic/Dockerfile'
const URL_UBUNTU_CORE_IMAGE = 'https://github.com/tianon/docker-brew-ubuntu-core/raw/dist-amd64/bionic/ubuntu-bionic-core-cloudimg-amd64-root.tar.gz' // or: https://partner-images.canonical.com/core/bionic/current/ubuntu-bionic-core-cloudimg-amd64-root.tar.gz

runMain(async (logger) => {
  logger.padLog('borrow file from github:tianon/docker-brew-ubuntu-core')
  const [ ubuntuCoreDockerfileBuffer, ubuntuCoreImageBuffer ] = await fetchGitHubBufferListWithLocalCache([ URL_DOCKERFILE, URL_UBUNTU_CORE_IMAGE ], URL_HASH, fromCache(`1804-${BUILD_FLAVOR}`))
  const dockerfileBuffer = Buffer.concat([ ubuntuCoreDockerfileBuffer, Buffer.from(extraDockerfileString) ])

  const SOURCE_HASH = createHash('sha1').update(dockerfileBuffer).update(ubuntuCoreImageBuffer).digest('base64').replace(/\W/g, '')
  const BUILD_TAG = `1804-${BUILD_FLAVOR}-${SOURCE_HASH}`
  const PATH_BUILD = fromOutput(BUILD_TAG)

  logger.padLog('build config')
  logger.log('BUILD_TAG:', BUILD_TAG)
  logger.log('PATH_BUILD:', PATH_BUILD)

  logger.padLog('check existing image')
  if (await getIsDockerImageExist(BUILD_REPO, BUILD_TAG)) logger.padLog('found existing image, skip build')
  else { // build new
    logger.padLog('assemble build directory (context)')
    await resetDirectory(PATH_BUILD)
    await writeFileAsync(fromOutput(PATH_BUILD, 'Dockerfile'), dockerfileBuffer) // concat Dockerfile config
    await writeFileAsync(fromOutput(PATH_BUILD, 'ubuntu-bionic-core-cloudimg-amd64-root.tar.gz'), ubuntuCoreImageBuffer)

    logger.padLog('build image')
    await runWithTee(fromOutput(`${BUILD_TAG}.log`), {
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
  }

  logger.padLog('save core image tag')
  await saveTagCoreAsync(__dirname, `${BUILD_REPO}:${BUILD_TAG}`)
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
RUN echo 'path-exclude=/usr/share/doc/*'                      >> /etc/dpkg/dpkg.cfg.d/excludes
RUN echo 'path-include=/usr/share/doc/*/copyright'            >> /etc/dpkg/dpkg.cfg.d/excludes
RUN echo 'path-exclude=/usr/share/locale/*/LC_MESSAGES/*.mo'  >> /etc/dpkg/dpkg.cfg.d/excludes
RUN echo 'path-exclude=/usr/share/man/*'                      >> /etc/dpkg/dpkg.cfg.d/excludes
RUN echo 'path-exclude=/usr/share/info/*'                     >> /etc/dpkg/dpkg.cfg.d/excludes

# clear left over files
RUN shopt -s nullglob \\
  && find /var/cache/apt/archives /var/lib/apt/lists /var/log /var/lib/dpkg/*-old /var/cache/debconf/*-old -not -name lock -type f -delete \\
  && find /usr/share/doc -not -name copyright -type f -delete \\
  && find /usr/share/doc -not -name copyright -type l -delete \\
  && find /usr/share/doc -type d -empty -delete \\
  && rm -rf /usr/share/man/* \\
  && rm -rf /usr/share/info/* \\
  && shopt -u nullglob
`
