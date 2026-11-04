#!/usr/bin/env bash

source ./0-1-base-apt.sh

# MNT
MNT_ZIP_C_HS="/mnt/build-layer-resource/chrome-hlsh-${DOCKER_BUILD_ARCH}.zip"

apt-update
  7z x "${MNT_ZIP_C_HS}" -o/tmp/ -bso0 -bsp0
  mv /tmp/chrome-headless-shell*/ /usr/local/lib/chrome-headless-shell/
  find /usr/local/lib/chrome-headless-shell/locales/ -maxdepth 1 -type f -name '*.pak' ! -name 'en-US*.pak' -delete # trim other lang pak
  ln -sfT /usr/local/lib/chrome-headless-shell/chrome-headless-shell /usr/bin/chrome-headless-shell

  # find missing lib with:
  #   ldd chromium | grep 'not found'
  #   dpkg -S libnss3.so
  apt-install libnspr4 libnss3 libdrm2 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libxkbcommon0 libasound2t64 libglib2.0-0t64 libatk-bridge2.0-0t64

  # why special care for `libgbm1`: the pkg has dep `mesa-libgallium`, which is huge & has sub-dep `libllvm19`
  # so just pick the `libgbm.so.1` and `libgbm.so.1.0.0`
  mkdir /tmp/pick-libgbm1/
  ( cd /tmp/pick-libgbm1/
    apt-get download libgbm1
    dpkg-deb -x libgbm1_*.deb /tmp/pick-libgbm1/
    mv /tmp/pick-libgbm1/usr/lib/*64-linux-gnu/libgbm.so.1* /usr/lib/*64-linux-gnu/
  )
  rm -r /tmp/pick-libgbm1/
apt-clear

ldd-chk /usr/bin/chrome-headless-shell
ldd-chk /usr/lib/x86_64-linux-gnu/libgbm.so.1 # verify hack working

# log version & info
/usr/bin/chrome-headless-shell --version
