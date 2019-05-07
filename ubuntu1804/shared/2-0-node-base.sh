#!/usr/bin/env bash

if [[ "${DOCKER_BUILD_MIRROR}" = "CN" ]] ; then
  alias npm-install-global='npm install -g --registry=https://registry.npm.taobao.org'
else
  alias npm-install-global='npm install -g'
fi

alias npm-clear='npm cache clean --force'
