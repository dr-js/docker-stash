#!/usr/bin/env bash

source ./0-1-base-apt.sh

apt-update
apt-install make gcc
# apt-clear # keep apt package list

# log version & info
cc --version
ld --version
make --version
