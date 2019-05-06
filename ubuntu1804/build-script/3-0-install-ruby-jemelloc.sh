#!/usr/bin/env bash

source ./0-0-base.sh

RUBY_DOWNLOAD_PATH="/root/temp-ruby"
RUBY_DOWNLOAD_FILE="${RUBY_DOWNLOAD_PATH}/ruby-2.5.5.tar.gz"

mkdir -p "${RUBY_DOWNLOAD_PATH}"
cd "${RUBY_DOWNLOAD_PATH}"

if [[ "${DOCKER_BUILD_IS_CN_MIRROR}" = "true" ]] ; then
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

# check: https://github.com/docker-library/ruby/blob/master/Dockerfile-debian.template#L38
mkdir -p /usr/local/etc # skip installing gem documentation
{
  echo 'install: --no-document';
  echo 'update: --no-document';
} >> /usr/local/etc/gemrc
{ # hack in "ENABLE_PATH_CHECK" disabling to suppress: warning: Insecure world writable dir
  echo '#define ENABLE_PATH_CHECK 0';
  echo;
  cat file.c;
} > file.c.new
mv file.c.new file.c

apt-update
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
# TODO: NOTE: 'dbm' compile will fail, but it's OK...

make -j "$(nproc)" # make clean
make install

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

cd
rm -rf "${RUBY_DOWNLOAD_PATH}"

# verify jemalloc, should output `-lpthread -ljemalloc -lgmp -ldl -lcrypt -lm`
ruby -r rbconfig -e "puts RbConfig::CONFIG['LIBS']"
