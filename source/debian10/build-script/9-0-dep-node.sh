#!/usr/bin/env bash

source ./0-0-base.sh

apt-update
  # TODO: the size increase is big (~70MiB), consider trim `/usr/share/icons/`?
  apt-install libgtk-3-0 libgbm1 \
    libasound2 libnss3 \
    libxss1 libxtst6
apt-clear
