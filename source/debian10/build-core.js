const { calcHash } = require('@dr-js/core/library/node/data/Buffer')
const { dockerWithTee, checkImageExist } = require('@dr-js/dev/library/docker')
const {
  writeFileSync,
  oneOf,
  runMain, resetDirectory,
  fromCache, fromOutput,
  fetchGitHubBufferListWithLocalCache, fetchFileWithLocalCache,
  saveTagCore, loadRepo
} = require('../function')

const BUILD_REPO = loadRepo(__dirname)
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

runMain(async (logger) => {
  logger.padLog('borrow file from github:debuerreotype/docker-debian-artifacts')
  const [
    coreDockerfileBuffer, coreImageBuffer
  ] = await fetchGitHubBufferListWithLocalCache([
    URL_DOCKERFILE, URL_CORE_IMAGE
  ], URL_HASH, fromCache('debian', '10-core-github'))
  const dockerfileBuffer = Buffer.concat([
    Buffer.from(`# syntax = ${BUILDKIT_SYNTAX}\n\n`),
    coreDockerfileBuffer,
    Buffer.from(getExtraDockerfileString({ DOCKER_BUILD_MIRROR }))
  ])

  const SOURCE_HASH = calcHash(Buffer.concat([ dockerfileBuffer, coreImageBuffer ])).replace(/\W/g, '')
  const BUILD_TAG = `10-${BUILD_FLAVOR}-${SOURCE_HASH}${DOCKER_BUILD_MIRROR ? `-${DOCKER_BUILD_MIRROR.toLowerCase()}` : ''}`
  const PATH_BUILD = fromOutput('debian', BUILD_TAG)
  const PATH_LOG = fromOutput('debian', `core#${BUILD_TAG}.log`)

  logger.padLog('build config')
  logger.log('BUILD_TAG:', BUILD_TAG)
  logger.log('PATH_BUILD:', PATH_BUILD)

  logger.padLog('check existing image')
  if (await checkImageExist(BUILD_REPO, BUILD_TAG)) logger.log('found existing image, skip build')
  else {
    logger.log('no existing image, build new')

    logger.padLog('assemble "/" (context)')
    await resetDirectory(PATH_BUILD)
    writeFileSync(fromOutput(PATH_BUILD, 'Dockerfile'), dockerfileBuffer)
    writeFileSync(fromOutput(PATH_BUILD, URL_CORE_IMAGE.split('/').pop()), coreImageBuffer)

    logger.padLog('assemble "build-core/"')
    {
      // update at 2021/02/20, to find download start from: https://packages.debian.org/search?keywords=ca-certificates
      const DEB_CA_CERTIFICATES = [ 'http://ftp.debian.org/debian/pool/main/c/ca-certificates/ca-certificates_20200601~deb10u2_all.deb', 'a9e267a24088c793a9cf782455fd344db5fdced714f112a8857c5bfd07179387' ]
      const DEB_OPENSSL = [ 'http://security.debian.org/debian-security/pool/updates/main/o/openssl/openssl_1.1.1d-0+deb10u5_amd64.deb', 'f4c32a3f851adeb0145edafb8ea271aed8330ee864de23f155f4141a81dc6e10' ]
      const DEB_LIBSSL = [ 'http://security.debian.org/debian-security/pool/updates/main/o/openssl/libssl1.1_1.1.1d-0+deb10u5_amd64.deb', '1741ec08b10caa4d3c8a165768323a14946278a7e6fb9cd56ae59cf4fe1ef970' ]
      // update at 2021/02/20, to find from: https://packages.debian.org/buster/libjemalloc2
      const DEB_LIBJEMALLOC = [ 'http://ftp.debian.org/debian/pool/main/j/jemalloc/libjemalloc2_5.1.0-3_amd64.deb', 'ecd3a4bbe5056dafc7eca4967a2b20c91c1fe6cdbbd9bbaab06896aa3e35afcd' ]

      await fetchFileWithLocalCache([
        [ ...DEB_CA_CERTIFICATES, fromOutput(PATH_BUILD, 'build-core/') ],
        [ ...DEB_OPENSSL, fromOutput(PATH_BUILD, 'build-core/') ],
        [ ...DEB_LIBSSL, fromOutput(PATH_BUILD, 'build-core/') ],
        [ ...DEB_LIBJEMALLOC, fromOutput(PATH_BUILD, 'build-core/') ]
      ], fromCache('debian', '10-core-url'))
      writeFileSync(fromOutput(PATH_BUILD, 'build-core/bashrc'), STRING_BASHRC)
    }

    logger.padLog('build image')
    await dockerWithTee([
      'image', 'build',
      '--tag', `${BUILD_REPO}:${BUILD_TAG}`,
      '--file', './Dockerfile',
      '--progress=plain', // https://docs.docker.com/develop/develop-images/build_enhancements/#new-docker-build-command-line-build-output
      '--squash', // merge layer // TODO: NOTE: this is a experimental Docker feature, need to manually enable
      '.' // context is always CWD
    ], { cwd: PATH_BUILD }, PATH_LOG)
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

RUN set -ex \\
 && { \\${_ && 'reset apt source list with buster-backports'}
       echo 'deb ${debianMirror}/debian buster main'; \\
       echo 'deb ${debianMirror}/debian buster-updates main'; \\
       echo 'deb ${debianMirror}/debian buster-backports main'; \\
       echo 'deb ${debianMirror}/debian-security/ buster/updates main'; \\
    } > /etc/apt/sources.list \\
 && { \\${_ && 'set apt to use buster-backports by default'}
      echo 'Package: *'; \\
      echo 'Pin: release a=buster-backports'; \\
      echo 'Pin-Priority: 800'; \\
    } > /etc/apt/preferences.d/backports \\
 && { \\${_ && 'reset dpkg file filter # https://askubuntu.com/a/628410'}
      echo 'path-exclude=/usr/share/doc/*'; \\
      echo 'path-include=/usr/share/doc/*/copyright'; \\
      echo 'path-exclude=/usr/share/locale/*/LC_MESSAGES/*.mo'; \\
      echo 'path-exclude=/usr/share/man/*'; \\
      echo 'path-exclude=/usr/share/info/*'; \\
    } > /etc/dpkg/dpkg.cfg.d/excludes \\
\\${_ && 'prepare apt cache # https://github.com/moby/buildkit/blob/master/frontend/dockerfile/docs/experimental.md#example-cache-apt-packages'}
 && shopt -s nullglob \\
 && rm -rf \\
      /etc/apt/apt.conf.d/docker-clean \\
      /var/log/* \\
      /var/cache/* \\
      /var/lib/apt/* \\
 && echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";'   > /etc/apt/apt.conf.d/keep-cache \\
 && shopt -u nullglob \\
\\${_ && 'check system time, apt update will fail if the time is off too much'}
 && date -uIs

RUN \\
  --mount=type=cache,target=/var/log \\
  --mount=type=cache,target=/var/cache \\
  --mount=type=cache,target=/var/lib/apt \\
  --mount=type=bind,target=/mnt/,source=. \\
\\${_ && 'add ssl & ca for https'}
    DEBIAN_FRONTEND=noninteractive dpkg -i /mnt/build-core/libssl*.deb \\
 && DEBIAN_FRONTEND=noninteractive dpkg -i /mnt/build-core/openssl*.deb \\
 && DEBIAN_FRONTEND=noninteractive dpkg -i /mnt/build-core/ca-certificates*.deb \\
\\${_ && 'add & use jemalloc by default, check: https://stackoverflow.com/questions/53234410/how-to-use-node-js-with-jemalloc/53412679#53412679'}
 && DEBIAN_FRONTEND=noninteractive dpkg -i /mnt/build-core/libjemalloc*.deb \\
 && echo "/usr/lib/x86_64-linux-gnu/libjemalloc.so.2" >> /etc/ld.so.preload \\
\\${_ && 'pull update and upgrade if any'}
 && DEBIAN_FRONTEND=noninteractive apt-get update -yq \\
 && DEBIAN_FRONTEND=noninteractive apt-get upgrade -yq \\
 && DEBIAN_FRONTEND=noninteractive apt-get autoremove -yq --purge \\
      -o APT::AutoRemove::RecommendsImportant=false \\
\\${_ && 'clear left over files'}
 && shopt -s nullglob \\
 && find /var/lib/dpkg/*-old -not -name lock -type f -delete \\
 && find /usr/share/doc -not -name copyright -type f -delete \\
 && find /usr/share/doc -not -name copyright -type l -delete \\
 && find /usr/share/doc -type d -empty -delete \\
 && rm -rf /usr/share/man/* \\
 && rm -rf /usr/share/info/* \\
 && shopt -u nullglob \\
\\${_ && 'reset root & default bashrc'}
 && cat /mnt/build-core/bashrc > /etc/bash.bashrc \\
 && (rm -rf /etc/skel/.* /root/.* || true) \\
\\${_ && 'log version & info'}
 && id \\
 && env \\
 && uname --all \\
 && bash --version \\
 && env --version \\
 && ls --version \\
 && cat --version \\
 && tar --version \\
 && gzip --version \\
`
const _ = '' // HACK: NOTE: hack for adding comment

const STRING_BASHRC = `
# If not running interactively, don't do anything
[[ -z "$PS1" ]] && return

# don't put duplicate lines in the history. See bash(1) for more options ... or force ignoredups and ignorespace
HISTCONTROL=ignoredups:ignorespace

# append to the history file, don't overwrite it
shopt -s histappend

# check the window size after each command and, if necessary, update the values of LINES and COLUMNS.
shopt -s checkwinsize

# make less more friendly for non-text input files, see lesspipe(1)
[[ -x /usr/bin/lesspipe ]] && eval "$(SHELL=/bin/sh lesspipe)"

# enable color support of ls and also add handy aliases
if [[ -x /usr/bin/dircolors ]]; then
  test -r ~/.dircolors && eval "$(dircolors -b ~/.dircolors)" || eval "$(dircolors -b)"
  alias ls='ls --color=auto'
  alias grep='grep --color=auto'
fi

PS1='\\u@\\h:\\w\\$ '

alias llh='ls -ahlF'
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias cb='cd ../'
alias cbb='cd ../../'
alias cbbb='cd ../../../'
alias cbbbb='cd ../../../../'
alias cbbbbb='cd ../../../../../'
`
