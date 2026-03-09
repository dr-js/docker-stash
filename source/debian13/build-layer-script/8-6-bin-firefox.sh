#!/usr/bin/env bash

source ./0-1-base-apt.sh

# MNT
MNT_DEB_FIREFOX="$(echo /mnt/build-layer-resource/firefox_*_${DOCKER_BUILD_ARCH}_*.deb)"

apt-update
  dpkg -i "${MNT_DEB_FIREFOX}" || apt-install --fix-broken # fix missing dependencies
apt-clear

if ldd /usr/bin/firefox | grep "not found"
then ldd /usr/bin/firefox && false # log what's wrong & return error
else echo "[ldd pass: firefox]"
fi

# log version & info
/usr/bin/firefox --version
