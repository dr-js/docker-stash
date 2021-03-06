#!/usr/bin/env bash

source ./0-3-base-ruby.sh

# MNT
MNT_TGZ_RUBY="$(echo /mnt/build-layer-resource/ruby-*.tar.gz)"

GEM_VERSION="3.2.16" # check version at: https://rubygems.org/pages/download
BUNDLER_MAJOR_VERSION="2"

apt-update
  # mostly borrowed from: https://github.com/docker-library/ruby/blob/master/2.5/buster/Dockerfile

  PATH_RUBY_BUILD="/root/.build-ruby"
  mkdir -p "${PATH_RUBY_BUILD}"
  tar -xf "${MNT_TGZ_RUBY}" \
    -C "${PATH_RUBY_BUILD}" \
    --strip-components=1
  ( cd "${PATH_RUBY_BUILD}"
    # hack in "ENABLE_PATH_CHECK" disabling to suppress: warning: Insecure world writable dir
    { echo '#define ENABLE_PATH_CHECK 0'
      echo
      cat file.c
    } > file.c.new
    mv file.c.new file.c

    # https://github.com/rbenv/ruby-build/wiki#suggested-build-environment
    apt-install \
      autoconf bison build-essential \
      libssl-dev        libssl1.1 \
      libyaml-dev       libyaml-0-2 \
      libreadline-dev   libreadline7 \
      zlib1g-dev        zlib1g \
      libncurses-dev    libncurses6 \
      libffi-dev        libffi6 \
      libgdbm-dev       libgdbm6 \
      libdb-dev         libdb5.3

    autoconf # may re-generate configure

    ./configure \
      --build="$(dpkg-architecture --query DEB_BUILD_GNU_TYPE)" \
      --disable-install-doc \
      --enable-shared

    make -j "$(nproc)"
    make install
  )
  rm -rf "${PATH_RUBY_BUILD}"

  apt-remove \
      autoconf bison build-essential \
      libssl-dev \
      libyaml-dev \
      libreadline-dev \
      zlib1g-dev \
      libncurses-dev \
      libffi-dev \
      libgdbm-dev \
      libdb-dev

  ruby -r rbconfig -e "puts RbConfig::CONFIG['LIBS']"
apt-clear

# gem
  if [[ "${DOCKER_BUILD_MIRROR}" = "CN" ]] ; then
    gem sources --add https://gems.ruby-china.com/ --remove https://rubygems.org/
    # gem sources --add https://mirrors.tuna.tsinghua.edu.cn/rubygems/ --remove https://rubygems.org/
    gem sources -l # check list sources
  fi

  gem update --no-document --system "${GEM_VERSION}"
  gem-uninstall rubygems-update # remove gem update dependency

  gem install --no-document --force bundler -v "~> ${BUNDLER_MAJOR_VERSION}" # use latest bundler # https://github.com/rubygems/rubygems/issues/2058

  if [[ "${DOCKER_BUILD_MIRROR}" = "CN" ]] ; then
    bundle config mirror.https://rubygems.org https://gems.ruby-china.com
    # bundle config mirror.https://rubygems.org https://mirrors.tuna.tsinghua.edu.cn/rubygems
  fi
gem-clear

ruby-path-clear /usr/local/lib/ruby/gems/*/gems/

# log version & info
ruby --version
gem env
bundle env
