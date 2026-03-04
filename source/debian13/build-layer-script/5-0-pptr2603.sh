#!/usr/bin/env bash

source ./0-1-base-apt.sh

# MNT
MNT_PUPPETEER_VERSION="$(cat /mnt/build-layer-resource/PUPPETEER_VERSION.txt)"

PUPPETEER_ROOT="/media/node-pptr2603" # where npm module is installed

# TODO: check if resolved: https://github.com/puppeteer/puppeteer/issues/10265#issuecomment-1568107293
# # NOTE: disable "/usr/lib/x86_64-linux-gnu/libjemalloc.so.2" (5.2.1-3, 5.1.0-3)
# #   as chromium will frequently crash (every 10min) with `SEGV_MAPERR`
# #   and down the outer node process
# #   also check: https://blog.chromium.org/2021/04/efficient-and-safe-allocations-everywhere.html
echo "" > /etc/ld.so.preload # TODO: disable when test become stable again

mkdir -p "${PUPPETEER_ROOT}"
( cd "${PUPPETEER_ROOT}"
  npm install "puppeteer-core@${MNT_PUPPETEER_VERSION}"

  # clear npm
  npm cache clean --force
  dr-dev --package-trim-node-modules "${PUPPETEER_ROOT}"
)

# symlink
ln -sfT "${PUPPETEER_ROOT}" "/media/node-pptr"
