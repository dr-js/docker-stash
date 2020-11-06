#!/usr/bin/env bash

source ./0-2-base-node.sh

apt-update
  # apt-install curl
  # (
  #   # https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions-enterprise-linux-fedora-and-snap-packages
  #   # https://github.com/nodesource/distributions/blob/master/README.md#debinstall
  #   curl -sL https://deb.nodesource.com/setup_14.x | bash -
  # )
  # apt-update
  # apt-install nodejs
  # apt-remove curl
  # apt-remove lsb-release # auto-installed by node setup script

  dpkg -i ../build-layer-node/nodejs*.deb || apt-install -f # fix missing dependencies like "python2"

  # mute npm
  mkdir -p ~/.config/configstore/
  echo "{\"optOut\":true}" > ~/.config/configstore/update-notifier-npm.json
  echo "update-notifier=false" > ~/.npmrc

  # update npm
  npm install --global ../build-layer-node/npm*.tgz

  # trim npm files
  rm -rf /usr/lib/node_modules/npm/changelogs/
  rm -rf /usr/lib/node_modules/npm/html/
  rm -rf /usr/lib/node_modules/npm/man/
  rm -rf /usr/lib/node_modules/npm/node_modules/ajv/dist/
  npm-clear
apt-clear

# log version & info
node --version
npm --version
npm config get cache # should be "/root/.npm/"
