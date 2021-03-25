#!/usr/bin/env bash

source ./0-1-base-apt.sh

apt-update
  # TODO: `libgtk-3-0` will bring in `systemd`, which is not used and not that tiny
  # NOTE: to test new Chrome, use `ldd chrome | grep not`
  # 2021/03/05 test with chrome linux 856583 (puppeteer@8.0.0)
  apt-install \
    libgtk-3-0 libgbm1 libnss3 libasound2 libx11-xcb1 \
    libxshmfence1 \
    libxtst6 libxss1 # patch for 706915 (puppeteer@2.0.0), remove later if not using, small size though
apt-clear
