#!/usr/bin/env bash

source ./0-0-base.sh

# MNT
MNT_TGZ_NODEJS="$(echo /mnt/build-layer-resource/node-@@@-${DOCKER_BUILD_ARCH}.tar.gz)"
MNT_TGZ_NPM="$(echo /mnt/build-layer-resource/npm*.tgz)"
MNT_TGZ_DR_JS="$(echo /mnt/build-layer-resource/dr-js*.tgz)"
MNT_TGZ_DR_DEV="$(echo /mnt/build-layer-resource/dr-dev*.tgz)"

# setup `node` binary
mkdir -p /tmp/nodejs-unpack/
( cd /tmp/nodejs-unpack/
  tar -xf "${MNT_TGZ_NODEJS}"
  mv node-v*-linux-*/bin/node /usr/bin/node # only pick single binary
)
rm -r /tmp/nodejs-unpack/

# use unpacked npm to install itself
mkdir -p /tmp/npm-unpack/
( cd /tmp/npm-unpack/
  tar -xf "${MNT_TGZ_NPM}"
  node "package/bin/npm-cli.js" install --global "${MNT_TGZ_NPM}"
)
rm -r /tmp/npm-unpack/

npm config set --global update-notifier false # mute npm update notice
npm install --global "${MNT_TGZ_DR_JS}" "${MNT_TGZ_DR_DEV}" # install package

# trim npm files
rm -rf /tmp/npm-*
rm -rf /usr/lib/node_modules/npm/changelogs/
rm -rf /usr/lib/node_modules/npm/html/
rm -rf /usr/lib/node_modules/npm/man/
rm -rf /usr/lib/node_modules/npm/scripts/

# clear npm
npm cache clean --force
dr-dev --package-trim-node-modules /usr/lib/node_modules/

# log version & info
node --version
npm --version
npm config get cache # should be "/root/.npm/"
dr-js --version | grep "packageVersion"
dr-dev --version | grep "packageVersion"

rm -r /tmp/node-compile-cache/ # drop module compilation cache since nodejs@22
