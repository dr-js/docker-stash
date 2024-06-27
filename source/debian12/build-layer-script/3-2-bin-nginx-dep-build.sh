#!/usr/bin/env bash

source ./0-1-base-apt.sh

# MNT
MNT_TGZ_NGINX="$(echo /mnt/build-layer-resource/nginx-*.tar.gz)"
MNT_ZIP_BROTLI="/mnt/build-layer-resource/brotli.zip"
MNT_ZIP_NGX_BROTLI="/mnt/build-layer-resource/ngx-brotli.zip"

# EXPECT build layer

apt-update
  # apt-install nginx-light # this version do not have brotli module, and a bit outdated (Dec 2018)

  # NOTE: GCC: compile will crash on qemu-arm-over-x86 build, similar report: https://bugs.launchpad.net/ubuntu/+source/gcc-10/+bug/1890435
  # BUILD_DEP="make gcc"
  BUILD_DEP=""

  # about why pcre2 is newer than pcre3: https://linux.debian.devel.narkive.com/s8mlB5Xw/pcre-package-naming and https://packages.debian.org/bookworm/libpcre2-dev
  apt-install ${BUILD_DEP} \
    libssl-dev \
    zlib1g-dev\
    libpcre2-dev
  # apt-install ${BUILD_DEP} \
  #   libssl-dev        libssl1.1 \
  #   zlib1g-dev        zlib1g \
  #   libpcre2-dev      libpcre2-8-0

  PATH_NGINX_BUILD="/root/.build-nginx"
  rm -rf "${PATH_NGINX_BUILD}"
  mkdir -p "${PATH_NGINX_BUILD}"
  tar -xf "${MNT_TGZ_NGINX}" -C "${PATH_NGINX_BUILD}" # under `nginx-*`
  unzip "${MNT_ZIP_BROTLI}" -d "${PATH_NGINX_BUILD}" # under `brotli-*`
  unzip "${MNT_ZIP_NGX_BROTLI}" -d "${PATH_NGINX_BUILD}" # under `ngx_brotli-*`
  PATH_NGINX="$(echo "${PATH_NGINX_BUILD}/nginx-"*)"
  PATH_BROTLI="$(echo "${PATH_NGINX_BUILD}/brotli-"*)"
  PATH_NGX_BROTLI="$(echo "${PATH_NGINX_BUILD}/ngx_brotli-"*)"

  # "restore" git submodule
  rm -rf "${PATH_NGX_BROTLI}/deps/brotli"
  ln -sfT "${PATH_BROTLI}" "${PATH_NGX_BROTLI}/deps/brotli"

  # build brotli, check: https://github.com/google/ngx_brotli/pull/150
  ( cd "${PATH_NGX_BROTLI}/deps/brotli/"
    mkdir -p "out/" && cd "out/"
    cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=./installed ..
    cmake --build . --config Release --target brotlienc
    # ls -al "${PATH_NGX_BROTLI}/deps/brotli/out/"
  )

  ls -al "${PATH_NGINX_BUILD}"
  ( cd "${PATH_NGINX}"
    # check for parameters: https://nginx.org/en/docs/configure.html
    # below mostly used Debian10 `nginx -V` output
    ./configure \
      --with-cc-opt='-s -g0 -O2 -Wformat -Wdate-time -Werror=format-security -fstack-protector-strong -flto -fPIC -D_FORTIFY_SOURCE=2' \
      --with-ld-opt='-s -Wl,-z,relro -Wl,-z,now -fstack-protector-strong -flto -fPIC' \
      --prefix=/tmp/nginx \
      --sbin-path=/usr/local/bin/nginx \
      --with-debug \
      --with-pcre-jit \
      --with-threads \
      --with-file-aio \
      --with-http_ssl_module \
      --with-http_gzip_static_module \
      --without-http_fastcgi_module \
      --without-http_uwsgi_module \
      --without-http_scgi_module \
      --without-http_grpc_module \
      --without-http_memcached_module \
      --with-stream \
      --with-stream_ssl_module \
      --with-stream_ssl_preread_module \
      --add-module="${PATH_NGX_BROTLI}"
    make -j "$(nproc)"
    make install
  )
#  rm -rf "${PATH_NGINX_BUILD}"
#
#  rm -rf /etc/nginx/*cgi*

#  apt-remove ${BUILD_DEP} \
#    libssl-dev \
#    zlib1g-dev \
#    libpcre3-dev
#apt-clear
