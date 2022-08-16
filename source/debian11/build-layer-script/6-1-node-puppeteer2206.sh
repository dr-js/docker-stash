#!/usr/bin/env bash

source ./0-1-base-apt.sh

# MNT
MNT_PUPPETEER_VERSION="$(cat /mnt/build-layer-resource/PUPPETEER_VERSION.txt)"
MNT_PUPPETEER_VERSION_ARM64="$(cat /mnt/build-layer-resource/PUPPETEER_VERSION_ARM64.txt)"

PUPPETEER_ROOT="/media/node-puppeteer2206/"

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
    npm install "puppeteer@${MNT_PUPPETEER_VERSION}"
  else
    apt-update
      # 14.2.0 (2022-06-01) chromium: roll to Chromium 103.0.5059.0 (r1002410)
      # up-to 15.0.2
      apt-install chromium # https://packages.debian.org/bullseye/chromium (103.0.5060.53-1~deb11u1)
    apt-clear
    # should run with `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium` env
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install "puppeteer@${MNT_PUPPETEER_VERSION_ARM64}"
  fi

  # clear npm
  npm cache clean --force
  dr-dev --package-trim-node-modules "${PUPPETEER_ROOT}"
)

if [[ "${DOCKER_BUILD_ARCH}" = "amd64" ]] ; then
  # log version & info
  test -e "${PUPPETEER_ROOT}/node_modules/puppeteer/.local-chromium/linux-"*"/chrome-linux/chrome"
  if ldd "${PUPPETEER_ROOT}/node_modules/puppeteer/.local-chromium/linux-"*"/chrome-linux/chrome" | grep "not found" ; then
    ldd "${PUPPETEER_ROOT}/node_modules/puppeteer/.local-chromium/linux-"*"/chrome-linux/chrome" && false # log what's wrong & return error
  else
    echo "[ldd pass]"
  fi
else
  test -e "/usr/bin/chromium"
fi
