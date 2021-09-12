#!/usr/bin/env bash

source ./0-2-base-node.sh

# MNT
MNT_DEB_NODEJS="$(echo /mnt/build-layer-resource/nodejs*_${DOCKER_BUILD_ARCH}.deb)"
MNT_TGZ_NPM="$(echo /mnt/build-layer-resource/npm*.tgz)"
MNT_TGZ_DR_JS="$(echo /mnt/build-layer-resource/dr-js*.tgz)"
MNT_TGZ_DR_DEV="$(echo /mnt/build-layer-resource/dr-dev*.tgz)"

apt-update
  # apt-install curl
  # (
  #   # https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions-enterprise-linux-fedora-and-snap-packages
  #   # https://github.com/nodesource/distributions/blob/master/README.md#debinstall
  #   curl -sL https://deb.nodesource.com/setup_14.x | bash -
  # )
  # apt-update
  # apt-install nodejs
  # apt-remove curl lsb-release # auto-installed by node setup script

  dpkg -i "${MNT_DEB_NODEJS}" || apt-install --fix-broken # fix missing dependencies like "python2"

  mkdir -p /root/.config/configstore/
  echo '{ "optOut": true, "lastUpdateCheck": 999999999999999 }' > /root/.config/configstore/update-notifier-npm.json
  npm config set --global update-notifier false # mute npm update notice
  npm install --global "${MNT_TGZ_NPM}" # update npm
  npm install --global "${MNT_TGZ_DR_JS}" "${MNT_TGZ_DR_DEV}" # install package

  # trim npm files
  rm -rf /tmp/npm-*
  rm -rf /usr/lib/node_modules/npm/changelogs/
  rm -rf /usr/lib/node_modules/npm/html/
  rm -rf /usr/lib/node_modules/npm/man/
  rm -rf /usr/lib/node_modules/npm/scripts/

  # clear npm
  npm cache clean --force
  rm -rf ~/.npm/
  node-path-clear /usr/lib/node_modules/
apt-clear

# log version & info
node --version
npm --version
npm config get cache # should be "/root/.npm/"
dr-js --version
dr-dev --version
