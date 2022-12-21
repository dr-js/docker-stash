#!/usr/bin/env bash

source ./0-1-base-apt.sh

# MNT
MNT_PUPPETEER_VERSION="$(cat /mnt/build-layer-resource/PUPPETEER_VERSION.txt)"
MNT_PUPPETEER_VERSION_ARM64="$(cat /mnt/build-layer-resource/PUPPETEER_VERSION_ARM64.txt)"

PUPPETEER_ROOT="/media/node-pptr2208" # npm module is installed
PUPPETEER_BIN="/media/node-pptr2208-bin" # symlink to 'chrome' bin

# TODO: check if resolved
# # NOTE: disable "/usr/lib/x86_64-linux-gnu/libjemalloc.so.2" (5.2.1-3, 5.1.0-3)
# #   as chromium will frequently crash (every 10min) with `SEGV_MAPERR`
# #   and down the outer node process
# #   also check: https://blog.chromium.org/2021/04/efficient-and-safe-allocations-everywhere.html
echo "" > /etc/ld.so.preload # TODO: disable when test become stable again

mkdir -p "${PUPPETEER_ROOT}"
( cd "${PUPPETEER_ROOT}"
  if [[ "${DOCKER_BUILD_MIRROR}" = "CN" ]] ; then
    export NPM_CONFIG_REGISTRY=https://registry.npmmirror.com
    export PUPPETEER_DOWNLOAD_HOST=https://npmmirror.com/mirrors
  fi

  if [[ "${DOCKER_BUILD_ARCH}" = "amd64" ]] ; then
    export PUPPETEER_CACHE_DIR="/var/cache/puppeteer"
    export PUPPETEER_DOWNLOAD_PATH="${PUPPETEER_ROOT}/chrome"
    mkdir -p "${PUPPETEER_DOWNLOAD_PATH}"
    npm install "puppeteer@${MNT_PUPPETEER_VERSION}"
    ln -sfT "${PUPPETEER_DOWNLOAD_PATH}/linux-"*"/chrome-linux/chrome" "${PUPPETEER_BIN}"
  else
    apt-update
      # 19.2.0 (2022-10-26) chromium: roll to Chromium 108.0.5351.0 (r1056772)
      # up-to 19.3.0
      apt-install chromium # https://packages.debian.org/bookworm/chromium (108.0.5359.124-1)
    apt-clear
    export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
    npm install "puppeteer@${MNT_PUPPETEER_VERSION_ARM64}"
    ln -sfT "/usr/bin/chromium" "${PUPPETEER_BIN}"
  fi

  # clear npm
  npm cache clean --force
  dr-dev --package-trim-node-modules "${PUPPETEER_ROOT}"
)

# should run with `PUPPETEER_EXECUTABLE_PATH="/media/node-pptr2208-bin"` env
test -e "${PUPPETEER_BIN}"
if ldd "${PUPPETEER_BIN}" | grep "not found" ; then
  ldd "${PUPPETEER_BIN}" && false # log what's wrong & return error
else
  echo "[ldd pass]"
fi
