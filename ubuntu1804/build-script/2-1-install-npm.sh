#!/usr/bin/env bash

source ./0-0-base.sh

if [[ "${DOCKER_BUILD_IS_CN_MIRROR}" = "true" ]] ; then
  alias npm-ig='npm install -g --registry=https://registry.npm.taobao.org'
else
  alias npm-ig='npm install -g'
fi

npm config set update-notifier false
npm-ig dr-js
npm cache clean --force
