#!/usr/bin/env bash

source ./0-1-base-apt.sh

PUPPETEER_VERSION="10.4.0" # check version at: https://github.com/puppeteer/puppeteer/releases
PUPPETEER_ROOT="/media/node-puppeteer10/"

# NOTE: disable "/usr/lib/x86_64-linux-gnu/libjemalloc.so.2" (5.1.0-3)
#   as chromium will frequently crash (every 10min) with `SEGV_MAPERR`
#   and down the outer node process
#   also check: https://blog.chromium.org/2021/04/efficient-and-safe-allocations-everywhere.html
echo "" > /etc/ld.so.preload # TODO: disable when test become stable again

mkdir -p "${PUPPETEER_ROOT}"
( cd "${PUPPETEER_ROOT}"
  if [[ "${DOCKER_BUILD_MIRROR}" = "CN" ]] ; then
    export NPM_CONFIG_REGISTRY=https://registry.npm.taobao.org
    export PUPPETEER_DOWNLOAD_HOST=https://npm.taobao.org/mirrors
  fi

  npm install "puppeteer@${PUPPETEER_VERSION}"

  # clear npm
  npm cache clean --force
  rm -rf ~/.npm/
  dr-dev --package-trim-node-modules "${PUPPETEER_ROOT}"
)

# log version & info
test -e "${PUPPETEER_ROOT}/node_modules/puppeteer/.local-chromium/linux-"*"/chrome-linux/chrome"
if ldd "${PUPPETEER_ROOT}/node_modules/puppeteer/.local-chromium/linux-"*"/chrome-linux/chrome" | grep "not found" ; then
  ldd "${PUPPETEER_ROOT}/node_modules/puppeteer/.local-chromium/linux-"*"/chrome-linux/chrome" && false # log what's wrong & return error
else
  echo "[ldd pass]"
fi
