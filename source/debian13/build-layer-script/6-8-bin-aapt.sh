#!/usr/bin/env bash

source ./0-1-base-apt.sh

apt-update
  apt-install aapt
apt-clear

# log version & info
aapt version
aapt2 version
