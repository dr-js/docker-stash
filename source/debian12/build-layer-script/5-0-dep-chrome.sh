#!/usr/bin/env bash

source ./0-1-base-apt.sh

apt-update
  # TODO: `libgtk-3-0` will bring in more package than needed
  # NOTE: to test new Chrome, use `ldd chrome | grep not`
  # 2022/08/25 test with Chromium 105.0.5173.0 (r1022525) (puppeteer@16.1.1)
  apt-install libasound2 libgbm1 libnss3 libgtk-3-0
apt-clear
