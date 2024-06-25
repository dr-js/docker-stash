#!/usr/bin/env bash

source ./0-3-base-ruby.sh

# MNT
MNT_TGZ_RUBY="$(echo /mnt/build-layer-resource/ruby-*.tar.gz)"
MNT_TGZ_OSSL="$(echo /mnt/build-layer-resource/openssl-1.1*.tar.gz)"

apt-update
  # mostly borrowed from: https://github.com/docker-library/ruby/blob/master/2.5/buster/Dockerfile

  PATH_RUBY_BUILD="/root/.build-ruby"
  rm -rf "${PATH_RUBY_BUILD}"
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
      autoconf bison make gcc \
      $(: "libssl-dev        libssl3 # ruby2 need openssl1.1, but debian12 only provide openssl3") \
      libyaml-dev       libyaml-0-2 \
      libreadline-dev   libreadline8 \
      zlib1g-dev        zlib1g \
      libncurses-dev    libncurses6 \
      libffi-dev        libffi8 \
      libgdbm-dev       libgdbm6 \
      libgmp-dev        libgmp10 \
      libdb-dev         libdb5.3

    ( PATH_OSSL_BUILD="/root/.build-ossl"
      rm -rf "${PATH_OSSL_BUILD}"
      mkdir -p "${PATH_OSSL_BUILD}"
      tar -xf "${MNT_TGZ_OSSL}" \
        -C "${PATH_OSSL_BUILD}" \
        --strip-components=1
      ( cd "${PATH_OSSL_BUILD}"
        ./config
        make -j "$(nproc)"
        make install
      )
    )

    mkdir -p /usr/local/etc/
    echo "install: --no-document" >> /usr/local/etc/gemrc
    echo "update: --no-document" >> /usr/local/etc/gemrc

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
      autoconf bison make gcc \
      $(: "libssl-dev") \
      libyaml-dev \
      libreadline-dev \
      zlib1g-dev \
      libncurses-dev \
      libffi-dev \
      libgdbm-dev \
      libgmp-dev \
      libdb-dev

  # rm -rf /usr/local/include/openssl/ # keep for later vendor build
  rm -rf /usr/local/share/doc/openssl/
  rm -rf /usr/local/share/man/*

  ruby -r rbconfig -e "puts RbConfig::CONFIG['LIBS']"
apt-clear

# gem
  gem install "rubygems-update:~>3.4" --no-document && update_rubygems # gem update --no-document --system # NOTE: v3.5 requires ruby@3, https://github.com/rubygems/rubygems/issues/2534
  gem-uninstall rubygems-update # remove gem update dependency
gem-clear

dr-dev --package-trim-ruby-gem /usr/local/lib/ruby/gems/*/gems/

# log version & info
ruby --version
gem env
bundle env
