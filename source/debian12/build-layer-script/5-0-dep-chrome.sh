#!/usr/bin/env bash

source ./0-1-base-apt.sh

apt-update
  # TODO: `libgtk-3-0` will bring in `systemd`, which is not used and not that tiny
  # NOTE: to test new Chrome, use `ldd chrome | grep not`
  # 2021/09/07 test with Chromium 92.0.4512.0 (r884014) (puppeteer@10.0.0)
  apt-install \
    libgtk-3-0 libgbm1 libnss3 libasound2 libx11-xcb1 \
    libxshmfence1
apt-clear
