const {
  writeFileSync, createHash,
  oneOf,
  runMain, resetDirectory,
  fromCache, fromOutput,
  toRunDockerConfig, runWithTee,
  fetchGitHubBufferListWithLocalCache, fetchUrlWithLocalCache,
  getIsDockerImageExist, saveTagCore
} = require('../function')

const BUILD_REPO = require('./BUILD_REPO.json')
const BUILDKIT_SYNTAX = require('./BUILDKIT_SYNTAX.json')
const BUILD_FLAVOR = 'core'

const [
  , // node
  , // script.js
  DOCKER_BUILD_MIRROR = '' // now support "CN" only
] = process.argv

oneOf(DOCKER_BUILD_MIRROR, [ '', 'CN' ])

const URL_HASH = 'https://api.github.com/repos/debuerreotype/docker-debian-artifacts/git/refs/heads/dist-amd64' // branch info
const URL_DOCKERFILE = 'https://github.com/debuerreotype/docker-debian-artifacts/raw/dist-amd64/buster/slim/Dockerfile'
const URL_CORE_IMAGE = 'https://github.com/debuerreotype/docker-debian-artifacts/raw/dist-amd64/buster/slim/rootfs.tar.xz'

// update at 2020/11/05, to find download start from: https://packages.debian.org/search?keywords=ca-certificates
const URL_DEB_CA_CERTIFICATES = 'http://ftp.debian.org/debian/pool/main/c/ca-certificates/ca-certificates_20200601~deb10u1_all.deb'
const URL_DEB_OPENSSL = 'http://ftp.debian.org/debian/pool/main/o/openssl/openssl_1.1.1d-0+deb10u3_amd64.deb'
const URL_DEB_LIBSSL = 'http://ftp.debian.org/debian/pool/main/o/openssl/libssl1.1_1.1.1d-0+deb10u3_amd64.deb'

runMain(async (logger) => {
  logger.padLog('borrow file from github:debuerreotype/docker-debian-artifacts')
  const [ coreDockerfileBuffer, coreImageBuffer ] = await fetchGitHubBufferListWithLocalCache([ URL_DOCKERFILE, URL_CORE_IMAGE ], URL_HASH, fromCache('debian', '10-core-github'))
  const dockerfileBuffer = Buffer.concat([
    Buffer.from(`# syntax = ${BUILDKIT_SYNTAX}\n\n`),
    coreDockerfileBuffer,
    Buffer.from(getExtraDockerfileString({ DOCKER_BUILD_MIRROR }))
  ])

  const SOURCE_HASH = createHash('sha1').update(dockerfileBuffer).update(coreImageBuffer).digest('base64').replace(/\W/g, '')
  const BUILD_TAG = `10-${BUILD_FLAVOR}-${SOURCE_HASH}${DOCKER_BUILD_MIRROR ? `-${DOCKER_BUILD_MIRROR.toLowerCase()}` : ''}`
  const PATH_BUILD = fromOutput('debian', BUILD_TAG)
  const PATH_LOG = fromOutput('debian', `${BUILD_TAG}.log`)

  logger.padLog('build config')
  logger.log('BUILD_TAG:', BUILD_TAG)
  logger.log('PATH_BUILD:', PATH_BUILD)

  logger.padLog('check existing image')
  if (await getIsDockerImageExist(BUILD_REPO, BUILD_TAG)) logger.padLog('found existing image, skip build')
  else {
    logger.padLog('no existing image, build new')

    logger.padLog('assemble "/" (context)')
    await resetDirectory(PATH_BUILD)
    writeFileSync(fromOutput(PATH_BUILD, URL_DOCKERFILE.split('/').pop()), dockerfileBuffer) // concat Dockerfile config
    writeFileSync(fromOutput(PATH_BUILD, URL_CORE_IMAGE.split('/').pop()), coreImageBuffer)

    logger.padLog('assemble "build-core/"')
    await resetDirectory(fromOutput(PATH_BUILD, 'build-core/'))
    const [
      debCaCertificatesBuffer, debOpensslBuffer, debLibsslBuffer
    ] = await fetchUrlWithLocalCache([
      URL_DEB_CA_CERTIFICATES, URL_DEB_OPENSSL, URL_DEB_LIBSSL
    ], fromCache('debian', '10-core-url'))
    writeFileSync(fromOutput(PATH_BUILD, 'build-core/', URL_DEB_CA_CERTIFICATES.split('/').pop()), debCaCertificatesBuffer)
    writeFileSync(fromOutput(PATH_BUILD, 'build-core/', URL_DEB_OPENSSL.split('/').pop()), debOpensslBuffer)
    writeFileSync(fromOutput(PATH_BUILD, 'build-core/', URL_DEB_LIBSSL.split('/').pop()), debLibsslBuffer)

    logger.padLog('build image')
    await runWithTee(PATH_LOG, toRunDockerConfig({
      argList: [
        'image', 'build',
        '--tag', `${BUILD_REPO}:${BUILD_TAG}`,
        '--file', 'Dockerfile',
        '--progress=plain', // https://docs.docker.com/develop/develop-images/build_enhancements/#new-docker-build-command-line-build-output
        '--squash', // merge layer // TODO: NOTE: this is a experimental Docker feature, need to manually enable
        '.' // context is always CWD
      ],
      option: { cwd: PATH_BUILD }
    }))
  }

  logger.padLog('save core image tag')
  saveTagCore(__dirname, DOCKER_BUILD_MIRROR, `${BUILD_REPO}:${BUILD_TAG}`)
}, 'build-core')

const getExtraDockerfileString = ({
  DOCKER_BUILD_MIRROR = '',
  debianMirror = DOCKER_BUILD_MIRROR === 'CN' ? 'https://mirrors.tuna.tsinghua.edu.cn' // https://mirrors.tuna.tsinghua.edu.cn/help/debian/
    : 'http://deb.debian.org' // https://wiki.debian.org/SourcesList#Example_sources.list
}) => `
# extra command to append

LABEL arg.DOCKER_BUILD_MIRROR=${JSON.stringify(DOCKER_BUILD_MIRROR)}
ENV DOCKER_BUILD_MIRROR=${JSON.stringify(DOCKER_BUILD_MIRROR)}
SHELL [ "/bin/bash", "-c" ]
WORKDIR /root/

RUN set -ex

# reset apt source list with buster-backports
RUN echo 'deb ${debianMirror}/debian buster main'                   >  /etc/apt/sources.list \\
 && echo 'deb ${debianMirror}/debian buster-updates main'           >> /etc/apt/sources.list \\
 && echo 'deb ${debianMirror}/debian buster-backports main'         >> /etc/apt/sources.list \\
 && echo 'deb ${debianMirror}/debian-security/ buster/updates main' >> /etc/apt/sources.list

# set apt to use buster-backports by default
RUN echo 'Package: *'                       >  /etc/apt/preferences.d/backports \\
 && echo 'Pin: release a=buster-backports'  >> /etc/apt/preferences.d/backports \\
 && echo 'Pin-Priority: 800'                >> /etc/apt/preferences.d/backports

# reset dpkg file filter # https://askubuntu.com/a/628410
RUN echo 'path-exclude=/usr/share/doc/*'                      >  /etc/dpkg/dpkg.cfg.d/excludes \\
 && echo 'path-include=/usr/share/doc/*/copyright'            >> /etc/dpkg/dpkg.cfg.d/excludes \\
 && echo 'path-exclude=/usr/share/locale/*/LC_MESSAGES/*.mo'  >> /etc/dpkg/dpkg.cfg.d/excludes \\
 && echo 'path-exclude=/usr/share/man/*'                      >> /etc/dpkg/dpkg.cfg.d/excludes \\
 && echo 'path-exclude=/usr/share/info/*'                     >> /etc/dpkg/dpkg.cfg.d/excludes

# prepare apt cache # https://github.com/moby/buildkit/blob/master/frontend/dockerfile/docs/experimental.md#example-cache-apt-packages
RUN shopt -s nullglob \\
 && rm -rf \\
      /etc/apt/apt.conf.d/docker-clean \\
      /var/log* \\
      /var/cache* \\
      /var/lib/apt/* \\
 && echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";'   > /etc/apt/apt.conf.d/keep-cache \\
 && shopt -u nullglob

# add ssl & ca for https
RUN \\
  --mount=type=cache,target=/var/log \\
  --mount=type=cache,target=/var/cache \\
  --mount=type=cache,target=/var/lib/apt \\
  --mount=type=bind,target=/root/.docker-build/,source=. \\
    DEBIAN_FRONTEND=noninteractive dpkg -i /root/.docker-build/build-core/libssl*.deb \\
 && DEBIAN_FRONTEND=noninteractive dpkg -i /root/.docker-build/build-core/openssl*.deb \\
 && DEBIAN_FRONTEND=noninteractive dpkg -i /root/.docker-build/build-core/ca-certificates*.deb

# check system time, apt update will fail if the time is off too much
RUN date -uIs

# pull update and upgrade if any
RUN \\
  --mount=type=cache,target=/var/log \\
  --mount=type=cache,target=/var/cache \\
  --mount=type=cache,target=/var/lib/apt \\
    DEBIAN_FRONTEND=noninteractive apt-get update -yq \\
 && DEBIAN_FRONTEND=noninteractive apt-get upgrade -yq \\
 && DEBIAN_FRONTEND=noninteractive apt-get autoremove -yq --purge \\
      -o APT::AutoRemove::RecommendsImportant=false

# clear left over files
RUN shopt -s nullglob \\
 && find /var/lib/dpkg/*-old -not -name lock -type f -delete \\
 && find /usr/share/doc -not -name copyright -type f -delete \\
 && find /usr/share/doc -not -name copyright -type l -delete \\
 && find /usr/share/doc -type d -empty -delete \\
 && rm -rf /usr/share/man/* \\
 && rm -rf /usr/share/info/* \\
 && shopt -u nullglob

# log version & info
RUN id \\
 && env \\
 && uname --all \\
 && bash --version \\
 && env --version \\
 && ls --version \\
 && cat --version \\
 && tar --version \\
 && gzip --version \\
`
