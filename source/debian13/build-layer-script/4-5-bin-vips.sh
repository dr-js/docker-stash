#!/usr/bin/env bash

source ./0-1-base-apt.sh

apt-update
  apt-install libvips42t64 gifsicle
apt-clear

ldd-chk /usr/lib/*-linux-gnu/libvips.so.42

# log version & info
ls -al /usr/lib/*-linux-gnu/libvips.so.42
gifsicle --version
