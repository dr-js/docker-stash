#!/usr/bin/env bash

source ./0-0-base.sh
source ./2-0-node-base.sh

apt-update
  apt-install curl

  shell-ex-off
  # https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions-enterprise-linux-fedora-and-snap-packages
  # https://github.com/nodesource/distributions/blob/master/README.md#debinstall
  curl -sL https://deb.nodesource.com/setup_12.x | bash -
  shell-ex-on

  apt-update
  apt-install nodejs

  apt-remove curl
  apt-remove lsb-release # auto-installed by node setup script
apt-clear

# npm
  npm-install-global npm
  # trim npm files
  rm -rf /usr/lib/node_modules/npm/changelogs/
  rm -rf /usr/lib/node_modules/npm/html/
  rm -rf /usr/lib/node_modules/npm/man/
  rm -rf /usr/lib/node_modules/npm/node_modules/ajv/dist/
npm-clear

npm config set update-notifier false
