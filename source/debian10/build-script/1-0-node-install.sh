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

  dpkg -i build-deb-node/nodejs*.deb || apt-install -f # fix missing dependencies
  rm -rf build-deb-node/

  # update & mute npm
  npm-install-global npm
  npm config set update-notifier false

  # trim npm files
  rm -rf /usr/lib/node_modules/npm/changelogs/
  rm -rf /usr/lib/node_modules/npm/html/
  rm -rf /usr/lib/node_modules/npm/man/
  rm -rf /usr/lib/node_modules/npm/node_modules/ajv/dist/
  npm-clear
apt-clear
