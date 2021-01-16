#!/usr/bin/env bash

source ./0-1-base-apt.sh

apt-update
  apt-install \
    sudo \
    less nano htop \
    zip unzip xz-utils p7zip-full $(: "tar gzip is already installed")
apt-clear

# log version & info
sudo --version
less --version
nano --version
htop --version
zip --version
unzip -v
xz --version
7z --help
