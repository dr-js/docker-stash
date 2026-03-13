#!/usr/bin/env bash

source ./0-1-base-apt.sh

apt-update
  apt-install \
    sudo gosu \
    procps $(: "provide ps|free|top|uptime|... commands, check: https://packages.debian.org/buster/procps") \
    less nano htop lsof screen \
    curl iproute2 iputils-ping netcat-openbsd \
    rsync $(: "for data backup") \
    zip unzip xz-utils p7zip-full $(: "tar gzip is already installed")
apt-clear

# log version & info
sudo --version | sed -n '1,4p'
gosu --version
ps --version # from `procps`
free --version # from `procps`
top --version # from `procps`
less --version | sed -n '1p'
nano --version
htop --version
lsof -v 2>&1 | sed -n '1,2p' # to allow htop list process open files
screen --version # allow backgrounding
curl --version
ip -Version # from `iproute2`
ss -version # from `iproute2`
ping4 -V # from `iputils-ping`
nc -help 2>&1 | sed -n '1p'
rsync --version | sed -n '1p'
zip --version | sed -n '1,2p'
unzip -v | sed -n '1p'
xz --version
7z --help | sed -n '1,3p'
