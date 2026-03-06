#!/usr/bin/env bash

source ./0-1-base-apt.sh

# MNT
MNT_TAR_CHS="/mnt/build-layer-resource/chrome-headless-shell.tar"

apt-update
  mkdir -p /usr/local/lib/chrome-headless-shell/
  tar -xf "${MNT_TAR_CHS}" -C /usr/local/lib/chrome-headless-shell/
  ln -sfT /usr/local/lib/chrome-headless-shell/headless-shell /usr/bin/chrome-headless-shell

  # find missing lib with:
  #   ldd chromium | grep 'not found'
  #   dpkg -S libnss3.so
  apt-install libnspr4 libnss3
apt-clear

if ldd /usr/bin/chrome-headless-shell | grep "not found"
then ldd /usr/bin/chrome-headless-shell && false # log what's wrong & return error
else echo "[ldd pass: chrome-headless-shell]"
fi

# log version & info
/usr/bin/chrome-headless-shell --version
