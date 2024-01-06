#!/usr/bin/env bash

source ./0-1-base-apt.sh

# MNT
MNT_PUPPETEER_VERSION="$(cat /mnt/build-layer-resource/PUPPETEER_VERSION.txt)"
MNT_PUPPETEER_VERSION_ARM64="$(cat /mnt/build-layer-resource/PUPPETEER_VERSION_ARM64.txt)"

PUPPETEER_ROOT="/media/node-pptr2206" # where npm module is installed
PUPPETEER_BIN="/media/node-pptr2206-bin" # symlink to 'chrome' bin

# TODO: check if resolved
# # NOTE: disable "/usr/lib/x86_64-linux-gnu/libjemalloc.so.2" (5.2.1-3, 5.1.0-3)
# #   as chromium will frequently crash (every 10min) with `SEGV_MAPERR`
# #   and down the outer node process
# #   also check: https://blog.chromium.org/2021/04/efficient-and-safe-allocations-everywhere.html
echo "" > /etc/ld.so.preload # TODO: disable when test become stable again

mkdir -p "${PUPPETEER_ROOT}"
( cd "${PUPPETEER_ROOT}"
  if [[ "${DOCKER_BUILD_ARCH}" = "amd64" ]] ; then
    export PUPPETEER_CACHE_DIR="/var/cache/puppeteer"
    npm install "puppeteer@${MNT_PUPPETEER_VERSION}"
    cp -aT "${PUPPETEER_CACHE_DIR}" "${PUPPETEER_ROOT}"
    # in 21.6.1 became: /media/node-pptr2208/chrome/linux-119.0.6045.105/chrome-linux64/chrome
    ln -sfT "${PUPPETEER_ROOT}/chrome/linux-"*"/chrome-linux"*"/chrome" "${PUPPETEER_BIN}"
  else
    apt-update
      apt-install chromium
    apt-clear
    export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
    npm install "puppeteer@${MNT_PUPPETEER_VERSION_ARM64}"
    ln -sfT "/usr/bin/chromium" "${PUPPETEER_BIN}"
  fi

  # clear npm
  npm cache clean --force
  dr-dev --package-trim-node-modules "${PUPPETEER_ROOT}"
)

# symlink
ln -sfT "${PUPPETEER_ROOT}" "/media/node-puppeteer2206" # support older layout
ln -sfT "${PUPPETEER_ROOT}" "/media/node-pptr"
ln -sfT "${PUPPETEER_BIN}" "/media/node-pptr-bin"

# should run with `PUPPETEER_EXECUTABLE_PATH="/media/node-pptr2206-bin"` env
test -e "${PUPPETEER_BIN}"
if ldd "${PUPPETEER_BIN}" | grep "not found" ; then
  ldd "${PUPPETEER_BIN}" && false # log what's wrong & return error
else
  echo "[ldd pass]"
fi
