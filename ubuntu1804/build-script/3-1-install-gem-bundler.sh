#!/usr/bin/env bash

source ./0-0-base.sh

if [[ "${DOCKER_BUILD_IS_CN_MIRROR}" = "true" ]] ; then
  gem sources --add https://gems.ruby-china.com/ --remove https://rubygems.org/
  gem sources -l # check list sources
fi

gem install bundler -v '~> 2' # use latest 2.x

if [[ "${DOCKER_BUILD_IS_CN_MIRROR}" = "true" ]] ; then
  bundle config mirror.https://rubygems.org https://gems.ruby-china.com
fi
