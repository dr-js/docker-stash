#!/usr/bin/env bash

source ./0-2-base-node.sh

PUPPETEER_VERSION="10.0.0" # check version at: https://github.com/puppeteer/puppeteer/releases
PUPPETEER_ROOT="/media/node-puppeteer10/"

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
  node-path-clear "${PUPPETEER_ROOT}"
)

# log version & info
test -e "${PUPPETEER_ROOT}/node_modules/puppeteer/.local-chromium/linux-"*"/chrome-linux/chrome"
if ldd "${PUPPETEER_ROOT}/node_modules/puppeteer/.local-chromium/linux-"*"/chrome-linux/chrome" | grep "not found" ; then
  ldd "${PUPPETEER_ROOT}/node_modules/puppeteer/.local-chromium/linux-"*"/chrome-linux/chrome" && false # log what's wrong & return error
else
  echo "[ldd pass]"
fi
