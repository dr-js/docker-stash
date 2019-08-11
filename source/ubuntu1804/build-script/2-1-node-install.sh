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

npm config set update-notifier false
npm-install-global npm
npm-clear

# trim npm files
rm -rf /usr/lib/node_modules/npm/changelogs/
rm -rf /usr/lib/node_modules/npm/html/
rm -rf /usr/lib/node_modules/npm/man/
rm -rf /usr/lib/node_modules/npm/node_modules/ajv/dist/

# from: https://github.com/tj/node-prune/blob/master/prune.go
find /usr/lib/node_modules/ \
  -name ".*" \
  -o -name "*.md" \
  -o -name "*.markdown" \
  -o -name "*.html" \
  -o -name "*.conf.js" \
  -o -name "*.config.js" \
  -o -name "*.config.json" \
  -o -name "*.js.map" \
  -o -name "*.ts" \
  -o -name "*.jst" \
  -o -name "*.coffee" \
  -type f \
  -delete
find /usr/lib/node_modules/ \
  -name ".idea" \
  -o -name ".vscode" \
  -o -name ".github" \
  -o -name ".circleci" \
  -o -name ".nyc_output" \
  -o -name "test" \
  -o -name "tests" \
  -o -name "doc" \
  -o -name "docs" \
  -o -name "example" \
  -o -name "examples" \
  -o -name "coverage" \
  -type d \
  -exec rm -rf {} +
