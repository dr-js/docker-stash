#!/usr/bin/env bash

source ./0-1-base-apt.sh

apt-update
apt-install make gcc cmake
# apt-clear # keep apt package list

# log version & info
set -o pipefail
cc --version | sed -n '1p'
ld --version | sed -n '1p'
make --version | sed -n '1,2p'
cmake --version | sed -n '1p'
