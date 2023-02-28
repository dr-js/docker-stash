const { calcHash } = require('@dr-js/core/library/node/data/Buffer.js')
const { writeBuffer, writeText } = require('@dr-js/core/library/node/fs/File.js')
const { resetDirectory } = require('@dr-js/core/library/node/fs/Directory.js')
const { runKit } = require('@dr-js/core/library/node/kit.js')

const { runDockerWithTee, checkPullImage } = require('@dr-js/dev/library/docker.js')
const {
  BUILDKIT_SYNTAX, DOCKER_BUILD_ARCH_INFO_LIST,
  DEBIAN11_BUILD_REPO, saveDebian11TagCore,
  fetchGitHubBufferMapWithLocalCache, fetchFileListWithLocalCache
} = require('../function.js')

runKit(async (kit) => {
  const BUILD_REPO = DEBIAN11_BUILD_REPO
  const BUILD_FLAVOR = 'core'

  kit.padLog('borrow file from github:debuerreotype/docker-debian-artifacts')

  const URL_CACHE_HASH = 'https://api.github.com/repos/debuerreotype/docker-debian-artifacts/git/refs/heads' // use all branch info as cache hash
  const URL_CORE_IMAGE_MAP = {
    'amd64': 'https://github.com/debuerreotype/docker-debian-artifacts/raw/dist-amd64/bullseye/slim/rootfs.tar.xz',
    'arm64': 'https://github.com/debuerreotype/docker-debian-artifacts/raw/dist-arm64v8/bullseye/slim/rootfs.tar.xz'
  }

  const DEB_FETCH_LIST = [
    // update at 2022/07/28, to find download start from: https://packages.debian.org/search?keywords=ca-certificates
    [ 'https://ftp.debian.org/debian/pool/main/c/ca-certificates/ca-certificates_20210119_all.deb', 'b2d488ad4d8d8adb3ba319fc9cb2cf9909fc42cb82ad239a26c570a2e749c389' ],
    [ 'https://ftp.debian.org/debian/pool/main/o/openssl/openssl_1.1.1n-0+deb11u3_amd64.deb', '3691cf432febeb8dd621c6a36e3cc66b45fc119016532ffb33c742861aec868b' ],
    [ 'https://ftp.debian.org/debian/pool/main/o/openssl/openssl_1.1.1n-0+deb11u3_arm64.deb', 'ff9a7649fa24c5d1fa5ddcbd4c4e9fd5facb205ddc7b796f61de1107dabb00fd' ],
    [ 'https://ftp.debian.org/debian/pool/main/o/openssl/libssl1.1_1.1.1n-0+deb11u3_amd64.deb', 'c3480bf90725c993187de02e5144e90ea81226e7e2538ba24687f5a0adc8ca5c' ],
    [ 'https://ftp.debian.org/debian/pool/main/o/openssl/libssl1.1_1.1.1n-0+deb11u3_arm64.deb', '8d4ef5a06719fabd90a6a27729ade7b9dde1a1c923a89ba1406af6489fa7c82f' ],
    // update at 2022/05/23, to find from: https://packages.debian.org/search?keywords=libjemalloc2
    [ 'https://ftp.debian.org/debian/pool/main/j/jemalloc/libjemalloc2_5.2.1-3_amd64.deb', 'dcb79555b137ad70c9d392ca31e04533e3a10b63aa0db02d5a26f464060cc0f5' ],
    [ 'https://ftp.debian.org/debian/pool/main/j/jemalloc/libjemalloc2_5.2.1-3_arm64.deb', '7e3537d43b3109183bec24be8e1154a7643ad6e03bb851f2ae0b5dc065954c99' ]
  ]

  const coreImageBufferMap = await fetchGitHubBufferMapWithLocalCache(URL_CORE_IMAGE_MAP, URL_CACHE_HASH, kit.fromTemp('debian11', 'core-github'))
  const dockerfileBufferMap = Object.fromEntries(DOCKER_BUILD_ARCH_INFO_LIST.map((DOCKER_BUILD_ARCH_INFO) => [ DOCKER_BUILD_ARCH_INFO.key, Buffer.from(getDockerfileString({ DOCKER_BUILD_ARCH_INFO })) ]))

  const SOURCE_HASH = calcHash(Buffer.concat([
    ...Object.values(coreImageBufferMap),
    ...Object.values(dockerfileBufferMap),
    Buffer.from(JSON.stringify(DEB_FETCH_LIST))
  ])).replace(/\W/g, '')
  const BUILD_TAG = `11-${BUILD_FLAVOR}-${SOURCE_HASH}`
  const PATH_BUILD = kit.fromOutput('debian11-core', BUILD_TAG)

  kit.padLog('build config')
  kit.log('BUILD_TAG:', BUILD_TAG)
  kit.log('PATH_BUILD:', PATH_BUILD)

  kit.padLog('check existing image')
  if (
    (await checkPullImage(BUILD_REPO, `${BUILD_TAG}-amd64`)) &&
    (await checkPullImage(BUILD_REPO, `${BUILD_TAG}-arm64`))
  ) kit.log('found existing image, skip build')
  else {
    kit.log('no existing image, build new')

    kit.padLog('assemble "/" (context)')
    await resetDirectory(PATH_BUILD)
    for (const DOCKER_BUILD_ARCH_INFO of DOCKER_BUILD_ARCH_INFO_LIST) {
      await writeBuffer(kit.fromOutput(PATH_BUILD, `rootfs.tar.xz.${DOCKER_BUILD_ARCH_INFO.key}`), coreImageBufferMap[ DOCKER_BUILD_ARCH_INFO.key ])
      await writeBuffer(kit.fromOutput(PATH_BUILD, `Dockerfile.${DOCKER_BUILD_ARCH_INFO.key}`), dockerfileBufferMap[ DOCKER_BUILD_ARCH_INFO.key ])
    }

    kit.padLog('assemble "build-core/"')
    await fetchFileListWithLocalCache(DEB_FETCH_LIST, {
      pathOutput: kit.fromOutput(PATH_BUILD, 'build-core/'),
      pathCache: kit.fromTemp('debian11', 'core-url')
    })
    await writeText(kit.fromOutput(PATH_BUILD, 'build-core/bashrc'), STRING_BASHRC)

    for (const DOCKER_BUILD_ARCH_INFO of DOCKER_BUILD_ARCH_INFO_LIST) {
      if (DOCKER_BUILD_ARCH_INFO.node !== process.arch) continue
      kit.padLog(`build image for ${DOCKER_BUILD_ARCH_INFO.key}`)

      const PATH_LOG = kit.fromOutput('debian11-core', `${BUILD_TAG}.${DOCKER_BUILD_ARCH_INFO.key}.log`)
      kit.log('PATH_LOG:', PATH_LOG)

      await runDockerWithTee([
        'image', 'build',
        `--tag=${BUILD_REPO}:${BUILD_TAG}-${DOCKER_BUILD_ARCH_INFO.key}`,
        `--file=./Dockerfile.${DOCKER_BUILD_ARCH_INFO.key}`,
        `--platform=${DOCKER_BUILD_ARCH_INFO.docker}`,
        '--progress=plain', // https://docs.docker.com/develop/develop-images/build_enhancements/#new-docker-build-command-line-build-output
        '--squash', // merge layer // TODO: NOTE: this is a experimental Docker feature, need to manually enable
        '.' // context is always CWD
      ], { cwd: PATH_BUILD }, PATH_LOG)
    }
  }

  kit.padLog('save core image tag')
  saveDebian11TagCore(`${BUILD_REPO}:${BUILD_TAG}`)
}, { title: 'build-core' })

const getDockerfileString = ({
  DOCKER_BUILD_ARCH_INFO
}) => `# syntax = ${BUILDKIT_SYNTAX}
FROM scratch

${_ && 'use prepared fs'}
ADD "rootfs.tar.xz.${DOCKER_BUILD_ARCH_INFO.key}" /

LABEL arg.DOCKER_BUILD_ARCH=${JSON.stringify(DOCKER_BUILD_ARCH_INFO.key)}
ENV DOCKER_BUILD_ARCH=${JSON.stringify(DOCKER_BUILD_ARCH_INFO.key)}
WORKDIR /root/
SHELL [ "/bin/bash", "-c" ]
CMD [ "bash" ]

ENV LANG C.UTF-8
ENV LC_ALL C.UTF-8

RUN set -ex \\
 && { \\${_ && 'reset apt source list with bullseye-backports'}
       echo 'deb http://deb.debian.org/debian bullseye main'; \\
       echo 'deb http://deb.debian.org/debian bullseye-updates main'; \\
       echo 'deb http://deb.debian.org/debian bullseye-backports main'; \\
       echo 'deb http://deb.debian.org/debian-security/ bullseye-security main'; \\
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

RUN \\${_ && 'check: https://github.com/moby/buildkit/blob/v0.9.0/frontend/dockerfile/docs/syntax.md'}
  --mount=type=cache,id=${DOCKER_BUILD_ARCH_INFO.key}-core-cache-0,target=/var/log \\
  --mount=type=cache,id=${DOCKER_BUILD_ARCH_INFO.key}-core-cache-1,target=/var/cache \\
  --mount=type=cache,id=${DOCKER_BUILD_ARCH_INFO.key}-core-cache-2,target=/var/lib/apt \\
  --mount=type=bind,target=/mnt/,source=. \\
    set -ex \\
\\${_ && 'add ssl & ca for https'}
 && DEBIAN_FRONTEND=noninteractive dpkg -i /mnt/build-core/libssl*_${DOCKER_BUILD_ARCH_INFO.debian}.deb \\
 && DEBIAN_FRONTEND=noninteractive dpkg -i /mnt/build-core/openssl*_${DOCKER_BUILD_ARCH_INFO.debian}.deb \\
 && DEBIAN_FRONTEND=noninteractive dpkg -i /mnt/build-core/ca-certificates*.deb \\
\\${_ && 'add & use jemalloc by default, check: https://stackoverflow.com/questions/53234410/how-to-use-node-js-with-jemalloc/53412679#53412679'}
 && DEBIAN_FRONTEND=noninteractive dpkg -i /mnt/build-core/libjemalloc*_${DOCKER_BUILD_ARCH_INFO.debian}.deb \\
 && echo "/usr/lib/${DOCKER_BUILD_ARCH_INFO.debianLibName}/libjemalloc.so.2" >> /etc/ld.so.preload \\
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
 && ( rm -rf /etc/skel/.* /root/.* || true ) \\
\\${_ && 'log version & info'}
 && id \\
 && env \\
 && uname --all \\
 && bash --version \\
 && env --version \\
 && ls --version \\
 && cat --version \\
 && tar --version \\
 && gzip --version
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
