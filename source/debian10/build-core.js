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
  const [ coreDockerfileBuffer, coreImageBuffer ] = await fetchGitHubBufferListWithLocalCache([ URL_DOCKERFILE, URL_CORE_IMAGE ], URL_HASH, fromCache('debian', '10-core'))
  const dockerfileBuffer = Buffer.concat([ coreDockerfileBuffer, Buffer.from(getExtraDockerfileString({ DOCKER_BUILD_MIRROR })) ])

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

    logger.padLog('assemble "build-deb/"')
    await resetDirectory(fromOutput(PATH_BUILD, 'build-deb/'))
    const [
      debCaCertificatesBuffer, debOpensslBuffer, debLibsslBuffer
    ] = await fetchUrlWithLocalCache([
      URL_DEB_CA_CERTIFICATES, URL_DEB_OPENSSL, URL_DEB_LIBSSL
    ], fromCache('debian', '10-core-deb'))
    writeFileSync(fromOutput(PATH_BUILD, 'build-deb/', URL_DEB_CA_CERTIFICATES.split('/').pop()), debCaCertificatesBuffer)
    writeFileSync(fromOutput(PATH_BUILD, 'build-deb/', URL_DEB_OPENSSL.split('/').pop()), debOpensslBuffer)
    writeFileSync(fromOutput(PATH_BUILD, 'build-deb/', URL_DEB_LIBSSL.split('/').pop()), debLibsslBuffer)

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
  saveTagCore(__dirname, DOCKER_BUILD_MIRROR, `${BUILD_REPO}:${BUILD_TAG}`)
}, 'build-core')

const getExtraDockerfileString = ({
  DOCKER_BUILD_MIRROR = '',
  debianMirror = DOCKER_BUILD_MIRROR === 'CN' ? 'https://mirrors.tuna.tsinghua.edu.cn' // https://mirrors.tuna.tsinghua.edu.cn/help/debian/
    : 'http://deb.debian.org' // https://wiki.debian.org/SourcesList#Example_sources.list
}) => `
# extra command to append

SHELL [ "/bin/bash", "-c" ]

RUN set -ex

# reset apt source list with buster-backports
RUN echo 'deb ${debianMirror}/debian buster main'                   >  /etc/apt/sources.list
RUN echo 'deb ${debianMirror}/debian buster-updates main'           >> /etc/apt/sources.list
RUN echo 'deb ${debianMirror}/debian buster-backports main'         >> /etc/apt/sources.list
RUN echo 'deb ${debianMirror}/debian-security/ buster/updates main' >> /etc/apt/sources.list

# set apt to use buster-backports by default
RUN echo 'Package: *'                       >  /etc/apt/preferences.d/backports
RUN echo 'Pin: release a=buster-backports'  >> /etc/apt/preferences.d/backports
RUN echo 'Pin-Priority: 800'                >> /etc/apt/preferences.d/backports

# reset dpkg file filter # https://askubuntu.com/a/628410
RUN echo 'path-exclude=/usr/share/doc/*'                      >  /etc/dpkg/dpkg.cfg.d/excludes
RUN echo 'path-include=/usr/share/doc/*/copyright'            >> /etc/dpkg/dpkg.cfg.d/excludes
RUN echo 'path-exclude=/usr/share/locale/*/LC_MESSAGES/*.mo'  >> /etc/dpkg/dpkg.cfg.d/excludes
RUN echo 'path-exclude=/usr/share/man/*'                      >> /etc/dpkg/dpkg.cfg.d/excludes
RUN echo 'path-exclude=/usr/share/info/*'                     >> /etc/dpkg/dpkg.cfg.d/excludes

# add ssl & ca for https
COPY ./build-deb/ ./build-deb/
RUN DEBIAN_FRONTEND=noninteractive dpkg -i ./build-deb/libssl*.deb
RUN DEBIAN_FRONTEND=noninteractive dpkg -i ./build-deb/openssl*.deb
RUN DEBIAN_FRONTEND=noninteractive dpkg -i ./build-deb/ca-certificates*.deb
RUN rm -rf ./build-deb/

# check system time, apt update will fail if the time is off too much
RUN date -uIs

# pull update and upgrade if any
RUN DEBIAN_FRONTEND=noninteractive apt-get update -yq
RUN DEBIAN_FRONTEND=noninteractive apt-get upgrade -yq
RUN DEBIAN_FRONTEND=noninteractive apt-get autoremove -yq --purge \\
  -o APT::AutoRemove::RecommendsImportant=false

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
