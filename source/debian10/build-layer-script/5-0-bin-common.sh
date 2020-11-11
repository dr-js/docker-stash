#!/usr/bin/env bash

source ./0-1-base-apt.sh

apt-update
  apt-install \
    less nano htop \
    xz-utils p7zip-full
apt-clear

# log version & info
less --version
nano --version
htop --version
xz --version
7z --help
