#!/usr/bin/env bash

source ./0-1-base-apt.sh

apt-update
  apt-install \
    sudo \
    procps $(: "provide ps|free|top|uptime|... commands, check: https://packages.debian.org/buster/procps") \
    less nano htop lsof screen vim-tiny \
    wget curl iproute2 netcat-openbsd \
    zip unzip xz-utils p7zip-full $(: "tar gzip is already installed")
apt-clear

# log version & info
sudo --version
ps --version # from `procps`
free --version # from `procps`
top -v # from `procps`
less --version
nano --version
htop --version
lsof -v # to allow htop list process open files
screen -v # allow backgrounding
vi --version # from `vim-tiny`, strangely not linked as `vim`
wget --version
curl --version
ip -Version # from `iproute2`
nc -help
zip --version
unzip -v
xz --version
7z --help
