#!/usr/bin/env bash

source ./0-3-base-ruby.sh

# MNT
MNT_TGZ_JRUBY="$(echo /mnt/build-layer-resource/jruby-*.tar.gz)"

BUNDLER_MAJOR_VERSION="2"

# mostly borrowed from: https://github.com/docker-library/ruby/blob/master/2.5/stretch/Dockerfile

PATH_JRUBY="/usr/share/jruby/"
mkdir -p "${PATH_JRUBY}"
tar -xf "${MNT_TGZ_JRUBY}" \
  -C "${PATH_JRUBY}" \
  --strip-components=1

# link to allow direct use some jruby bin, other command like `irb` can still be run with `jruby -S irb`
ln -sfT /usr/share/jruby/bin/jruby  /usr/bin/jruby
ln -sfT /usr/share/jruby/bin/jrubyc /usr/bin/jrubyc
ln -sfT /usr/share/jruby/bin/gem    /usr/bin/gem # will load `jgem` in same path
ln -sfT /usr/share/jruby/bin/jgem   /usr/bin/jgem
ln -sfT /usr/share/jruby/bin/bundle /usr/bin/bundle

# trim some big files
rm -rf /usr/share/jruby/bin/*.bat
rm -rf /usr/share/jruby/bin/*.exe
rm -rf /usr/share/jruby/bin/*.dll

# gem
  if [[ "${DOCKER_BUILD_MIRROR}" = "CN" ]] ; then
    gem sources --add https://gems.ruby-china.com/ --remove https://rubygems.org/
    # gem sources --add https://mirrors.tuna.tsinghua.edu.cn/rubygems/ --remove https://rubygems.org/
    gem sources -l # check list sources
  fi

  # gem update --no-document --system # should have the latest version in jruby tgz

  gem install --no-document --force bundler -v "~> ${BUNDLER_MAJOR_VERSION}" # use latest bundler # https://github.com/rubygems/rubygems/issues/2058

  if [[ "${DOCKER_BUILD_MIRROR}" = "CN" ]] ; then
    bundle config mirror.https://rubygems.org https://gems.ruby-china.com
    # bundle config mirror.https://rubygems.org https://mirrors.tuna.tsinghua.edu.cn/rubygems
  fi
gem-clear

ruby-path-clear /usr/share/jruby/lib/ruby/gems/*/gems/

# log version & info
jruby --version
gem env
bundle env
