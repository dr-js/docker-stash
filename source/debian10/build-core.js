const { createHash } = require('crypto')
const { writeFileSync } = require('fs')
const { runMain } = require('@dr-js/dev/library/main')
const {
  resetDirectory,
  fromCache, fromOutput,
  toRunDockerConfig, runWithTee,
  fetchGitHubBufferListWithLocalCache,
  getIsDockerImageExist, saveTagCore
} = require('../function')

const BUILD_REPO = require('./BUILD_REPO.json')
const BUILD_FLAVOR = 'core'

const URL_HASH = 'https://api.github.com/repos/debuerreotype/docker-debian-artifacts/git/refs/heads/dist-amd64' // branch info
const URL_DOCKERFILE = 'https://github.com/debuerreotype/docker-debian-artifacts/raw/dist-amd64/buster/slim/Dockerfile'
const URL_CORE_IMAGE = 'https://github.com/debuerreotype/docker-debian-artifacts/raw/dist-amd64/buster/slim/rootfs.tar.xz'

runMain(async (logger) => {
  logger.padLog('borrow file from github:debuerreotype/docker-debian-artifacts')
  const [ coreDockerfileBuffer, coreImageBuffer ] = await fetchGitHubBufferListWithLocalCache([ URL_DOCKERFILE, URL_CORE_IMAGE ], URL_HASH, fromCache('debian', `10-${BUILD_FLAVOR}`))
  const dockerfileBuffer = Buffer.concat([ coreDockerfileBuffer, Buffer.from(extraDockerfileString) ])

  const SOURCE_HASH = createHash('sha1').update(dockerfileBuffer).update(coreImageBuffer).digest('base64').replace(/\W/g, '')
  const BUILD_TAG = `10-${BUILD_FLAVOR}-${SOURCE_HASH}`
  const PATH_BUILD = fromOutput('debian', BUILD_TAG)
  const PATH_LOG = fromOutput('debian', `${BUILD_TAG}.log`)

  logger.padLog('build config')
  logger.log('BUILD_TAG:', BUILD_TAG)
  logger.log('PATH_BUILD:', PATH_BUILD)

  logger.padLog('check existing image')
  if (await getIsDockerImageExist(BUILD_REPO, BUILD_TAG)) logger.padLog('found existing image, skip build')
  else { // build new
    logger.padLog('assemble build directory (context)')
    await resetDirectory(PATH_BUILD)
    writeFileSync(fromOutput(PATH_BUILD, URL_DOCKERFILE.split('/').pop()), dockerfileBuffer) // concat Dockerfile config
    writeFileSync(fromOutput(PATH_BUILD, URL_CORE_IMAGE.split('/').pop()), coreImageBuffer)

    logger.padLog('build image')
    await runWithTee(PATH_LOG, toRunDockerConfig({
      argList: [
        'image', 'build',
        '--tag', `${BUILD_REPO}:${BUILD_TAG}`,
        '--file', 'Dockerfile',
        '--squash', // merge layer
        '.' // context is always CWD
      ],
      option: { cwd: PATH_BUILD }
    }))
  }

  logger.padLog('save core image tag')
  saveTagCore(__dirname, `${BUILD_REPO}:${BUILD_TAG}`)
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
