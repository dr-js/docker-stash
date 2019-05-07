#!/usr/bin/env bash

source ./0-0-base.sh
source ./3-0-ruby-base.sh

RUBY_DOWNLOAD_PATH="/root/temp-ruby"
RUBY_DOWNLOAD_FILE="${RUBY_DOWNLOAD_PATH}/ruby-2.5.5.tar.gz"

mkdir -p "${RUBY_DOWNLOAD_PATH}"
cd "${RUBY_DOWNLOAD_PATH}"

if [[ "${DOCKER_BUILD_MIRROR}" = "CN" ]] ; then
  RUBY_SRC_URL="https://cache.ruby-china.com/pub/ruby/2.5/ruby-2.5.5.tar.gz" # [CN-ONLY] download speed up (download from source is slow)
else
  RUBY_SRC_URL="https://cache.ruby-lang.org/pub/ruby/2.5/ruby-2.5.5.tar.gz"
fi

apt-update
apt-install curl
curl -L -o "${RUBY_DOWNLOAD_FILE}" \
  "${RUBY_SRC_URL}"
apt-remove curl

tar -zxvf "${RUBY_DOWNLOAD_FILE}" \
  -C "${RUBY_DOWNLOAD_PATH}" \
  --strip-components=1

# mostly borrowed from: https://github.com/docker-library/ruby/blob/master/2.5/stretch/Dockerfile

# skip installing gem documentation
mkdir -p /usr/local/etc
{ echo 'install: --no-document'
  echo 'update: --no-document'
} >> /usr/local/etc/gemrc

# hack in "ENABLE_PATH_CHECK" disabling to suppress: warning: Insecure world writable dir
{ echo '#define ENABLE_PATH_CHECK 0'
  echo
  cat file.c
} > file.c.new
mv file.c.new file.c

# https://github.com/rbenv/ruby-build/wiki#suggested-build-environment
apt-install \
  autoconf bison build-essential \
  zlib1g-dev        zlib1g \
  libssl-dev        libssl1.1 \
  libyaml-dev       libyaml-0-2 \
  libreadline-dev   libreadline7 \
  libncurses5-dev   libncurses5 \
  libffi-dev        libffi6 \
  libgdbm-dev       libgdbm5

apt-install \
  libjemalloc-dev   libjemalloc1

autoconf # may re-geneate configure

./configure \
  --build="$(dpkg-architecture --query DEB_BUILD_GNU_TYPE)" \
  --disable-install-doc \
  --enable-shared \
  --with-jemalloc

# TODO: NOTE: 'dbm' compile will fail, but it's OK, maybe...
make -j "$(nproc)"
make install

cd
rm -rf "${RUBY_DOWNLOAD_PATH}"

apt-remove \
  autoconf bison build-essential \
  zlib1g-dev \
  libssl-dev \
  libyaml-dev \
  libreadline-dev \
  libncurses5-dev \
  libffi-dev \
  libgdbm-dev \
  libjemalloc-dev
apt-clear

# verify jemalloc, should output `-lpthread -ljemalloc -lgmp -ldl -lcrypt -lm`
ruby -r rbconfig -e "puts RbConfig::CONFIG['LIBS']"

if [[ "${DOCKER_BUILD_MIRROR}" = "CN" ]] ; then
  gem sources --add https://gems.ruby-china.com/ --remove https://rubygems.org/
  gem sources -l # check list sources
fi

gem update --system "3.0.3"
gem-uninstall rubygems-update # remove gem update dependency

gem install --force bundler -v '~> 2' # use latest 2.x bundler # https://github.com/rubygems/rubygems/issues/2058

if [[ "${DOCKER_BUILD_MIRROR}" = "CN" ]] ; then
  bundle config mirror.https://rubygems.org https://gems.ruby-china.com
fi

gem-clear
