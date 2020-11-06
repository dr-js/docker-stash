#!/usr/bin/env bash

source ./0-1-base-apt.sh

apt-update
  apt-install \
    less nano htop \
    p7zip-full
apt-clear

# log version & info
less --version
nano --version
htop --version
7z --help
