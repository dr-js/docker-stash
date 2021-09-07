const { oneOf } = require('@dr-js/core/library/common/verify.js')
const { calcHash } = require('@dr-js/core/library/node/data/Buffer.js')
const { writeBuffer, writeText } = require('@dr-js/core/library/node/fs/File.js')
const { resetDirectory } = require('@dr-js/core/library/node/fs/Directory.js')
const { runKit } = require('@dr-js/core/library/node/kit.js')

const { runDockerWithTee, checkPullImage } = require('@dr-js/dev/library/docker.js')
const {
  BUILDKIT_SYNTAX,
  DEBIAN11_BUILD_REPO, saveDebian11TagCore,
  fetchGitHubBufferListWithLocalCache, fetchFileWithLocalCache
} = require('../function.js')

const [
  , // node
  , // script.js
  DOCKER_BUILD_MIRROR = '' // now support "CN" only
] = process.argv

oneOf(DOCKER_BUILD_MIRROR, [ '', 'CN' ])

const URL_HASH = 'https://api.github.com/repos/debuerreotype/docker-debian-artifacts/git/refs/heads/dist-amd64' // branch info
const URL_DOCKERFILE = 'https://github.com/debuerreotype/docker-debian-artifacts/raw/dist-amd64/bullseye/slim/Dockerfile'
const URL_CORE_IMAGE = 'https://github.com/debuerreotype/docker-debian-artifacts/raw/dist-amd64/bullseye/slim/rootfs.tar.xz'

runKit(async (kit) => {
  const BUILD_REPO = DEBIAN11_BUILD_REPO
  const BUILD_FLAVOR = 'core'

  kit.padLog('borrow file from github:debuerreotype/docker-debian-artifacts')
  const [
    coreDockerfileBuffer, coreImageBuffer
  ] = await fetchGitHubBufferListWithLocalCache([
    URL_DOCKERFILE, URL_CORE_IMAGE
  ], URL_HASH, kit.fromTemp('debian11', 'core-github'))
  const dockerfileBuffer = Buffer.concat([
    Buffer.from(`# syntax = ${BUILDKIT_SYNTAX}\n\n`),
    coreDockerfileBuffer,
    Buffer.from(getExtraDockerfileString({ DOCKER_BUILD_MIRROR }))
  ])

  const SOURCE_HASH = calcHash(Buffer.concat([ dockerfileBuffer, coreImageBuffer ])).replace(/\W/g, '')
  const BUILD_TAG = `11-${BUILD_FLAVOR}-${SOURCE_HASH}${DOCKER_BUILD_MIRROR ? `-${DOCKER_BUILD_MIRROR.toLowerCase()}` : ''}`
  const PATH_BUILD = kit.fromOutput('debian11-core', BUILD_TAG)
  const PATH_LOG = kit.fromOutput('debian11-core', `${BUILD_TAG}.log`)

  kit.padLog('build config')
  kit.log('BUILD_TAG:', BUILD_TAG)
  kit.log('PATH_BUILD:', PATH_BUILD)
  kit.log('PATH_LOG:', PATH_LOG)

  kit.padLog('check existing image')
  if (await checkPullImage(BUILD_REPO, BUILD_TAG)) kit.log('found existing image, skip build')
  else {
    kit.log('no existing image, build new')

    kit.padLog('assemble "/" (context)')
    await resetDirectory(PATH_BUILD)
    await writeBuffer(kit.fromOutput(PATH_BUILD, 'Dockerfile'), dockerfileBuffer)
    await writeBuffer(kit.fromOutput(PATH_BUILD, URL_CORE_IMAGE.split('/').pop()), coreImageBuffer)

    kit.padLog('assemble "build-core/"')
    {
      // update at 2021/09/07, to find download start from: https://packages.debian.org/search?keywords=ca-certificates
      const DEB_CA_CERTIFICATES = [ 'http://ftp.debian.org/debian/pool/main/c/ca-certificates/ca-certificates_20210119_all.deb', 'b2d488ad4d8d8adb3ba319fc9cb2cf9909fc42cb82ad239a26c570a2e749c389' ]
      const DEB_OPENSSL = [ 'http://ftp.debian.org/debian/pool/main/o/openssl/openssl_1.1.1k-1_amd64.deb', 'a5eed50b8df5840a1d8adbf9087dcdbd01be7c2e2038c741dd50c207ef5cffa1' ]
      const DEB_LIBSSL = [ 'http://ftp.debian.org/debian/pool/main/o/openssl/libssl1.1_1.1.1k-1_amd64.deb', '74055ee6421dc2aaa37c95e9076725aa77bf9e80ecf66cb8d1c6862c660904bb' ]
      // update at 2021/09/07, to find from: https://packages.debian.org/search?keywords=libjemalloc2
      const DEB_LIBJEMALLOC = [ 'http://ftp.debian.org/debian/pool/main/j/jemalloc/libjemalloc2_5.2.1-3_amd64.deb', 'dcb79555b137ad70c9d392ca31e04533e3a10b63aa0db02d5a26f464060cc0f5' ]

      await fetchFileWithLocalCache([
        [ ...DEB_CA_CERTIFICATES, kit.fromOutput(PATH_BUILD, 'build-core/') ],
        [ ...DEB_OPENSSL, kit.fromOutput(PATH_BUILD, 'build-core/') ],
        [ ...DEB_LIBSSL, kit.fromOutput(PATH_BUILD, 'build-core/') ],
        [ ...DEB_LIBJEMALLOC, kit.fromOutput(PATH_BUILD, 'build-core/') ]
      ], kit.fromTemp('debian11', 'core-url'))
      await writeText(kit.fromOutput(PATH_BUILD, 'build-core/bashrc'), STRING_BASHRC)
    }

    kit.padLog('build image')
    await runDockerWithTee([
      'image', 'build',
      '--tag', `${BUILD_REPO}:${BUILD_TAG}`,
      '--file', './Dockerfile',
      '--progress=plain', // https://docs.docker.com/develop/develop-images/build_enhancements/#new-docker-build-command-line-build-output
      '--squash', // merge layer // TODO: NOTE: this is a experimental Docker feature, need to manually enable
      '.' // context is always CWD
    ], { cwd: PATH_BUILD }, PATH_LOG)
  }

  kit.padLog('save core image tag')
  saveDebian11TagCore(DOCKER_BUILD_MIRROR, `${BUILD_REPO}:${BUILD_TAG}`)
}, { title: 'build-core' })

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
 && { \\${_ && 'reset apt source list with bullseye-backports'}
       echo 'deb ${debianMirror}/debian bullseye main'; \\
       echo 'deb ${debianMirror}/debian bullseye-updates main'; \\
       echo 'deb ${debianMirror}/debian bullseye-backports main'; \\
       echo 'deb ${debianMirror}/debian-security/ bullseye-security main'; \\
    } > /etc/apt/sources.list \\
 && { \\${_ && 'set apt to use bullseye-backports by default'}
      echo 'Package: *'; \\
      echo 'Pin: release a=bullseye-backports'; \\
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