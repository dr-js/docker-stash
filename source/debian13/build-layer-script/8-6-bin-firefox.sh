#!/usr/bin/env bash

source ./0-1-base-apt.sh

# MNT
MNT_DEB_FIREFOX="$(echo /mnt/build-layer-resource/firefox_*_${DOCKER_BUILD_ARCH}_*.deb)"

apt-update
  dpkg -i "${MNT_DEB_FIREFOX}" || apt-install --fix-broken # fix missing dependencies
apt-clear

ldd-chk /usr/bin/firefox

# log version & info
/usr/bin/firefox --version
