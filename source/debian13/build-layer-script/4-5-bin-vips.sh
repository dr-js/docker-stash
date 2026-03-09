#!/usr/bin/env bash

source ./0-1-base-apt.sh

apt-update
  apt-install libvips42t64 gifsicle
apt-clear

if ldd /usr/lib/*-linux-gnu/libvips.so.42 | grep "not found"
then ldd /usr/lib/*-linux-gnu/libvips.so.42 && false # log what's wrong & return error
else echo "[ldd pass: libvips]"
fi

# log version & info
ls -al /usr/lib/*-linux-gnu/libvips.so.42
gifsicle --version
