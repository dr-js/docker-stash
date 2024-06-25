#!/usr/bin/env bash

source ./0-1-base-apt.sh

# MNT
MNT_DEB_FLUENTBIT="$(echo /mnt/build-layer-resource/fluent-bit*_${DOCKER_BUILD_ARCH}.deb)"

apt-update
  dpkg -i "${MNT_DEB_FLUENTBIT}" || apt-install --fix-broken # fix missing dependencies like "libyaml"

  # trim extra files
  rm -rf /etc/fluent-bit/
  rm -rf /lib/fluent-bit/
  rm -rf /lib/systemd/system/fluent-bit.service
apt-clear

# log version & info
/opt/fluent-bit/bin/fluent-bit --version
