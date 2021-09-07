#!/usr/bin/env bash

source ./0-1-base-apt.sh

# MNT
MNT_TGZ_NGINX="$(echo /mnt/build-layer-resource/nginx-*.tar.gz)"
MNT_ZIP_BROTLI="/mnt/build-layer-resource/brotli.zip"
MNT_ZIP_NGX_BROTLI="/mnt/build-layer-resource/ngx-brotli.zip"

apt-update
  # apt-install nginx-light # this version do not have brotli module, and a bit outdated (Dec 2018)

  apt-install build-essential \
    libssl-dev        libssl1.1 \
    zlib1g-dev        zlib1g \
    libpcre3-dev      libpcre3

  PATH_NGINX_BUILD="/root/.build-nginx"
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

  ls -al "${PATH_NGINX_BUILD}"
  ( cd "${PATH_NGINX}"
    # check for parameters: https://nginx.org/en/docs/configure.html
    # below mostly used Debian10 `nginx -V` output
    # NOTE: the `-flto` option which trims output ~13M->~8M is from: https://gist.github.com/JoeUX/ae339373eea94fdaac65f9a842026e06#file-compile-nginx-sh-L73
    #   though the Debian10 nginx is ~1M
    ./configure \
      --with-cc-opt='-g -O2 -flto -fstack-protector-strong -Wformat -Werror=format-security -fPIC -Wdate-time -D_FORTIFY_SOURCE=2' \
      --with-ld-opt='-Wl,-z,relro -Wl,-z,now -fPIC' \
      --prefix=/usr/share/nginx \
      --sbin-path=/usr/local/bin/nginx \
      --conf-path=/etc/nginx/nginx.conf \
      --http-log-path=/var/log/nginx/access.log \
      --error-log-path=/var/log/nginx/error.log \
      --lock-path=/var/lock/nginx.lock \
      --pid-path=/run/nginx.pid \
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
  rm -rf "${PATH_NGINX_BUILD}"

  rm -rf /etc/nginx/*cgi*

  apt-remove build-essential \
    libssl-dev \
    zlib1g-dev \
    libpcre3-dev
apt-clear

# log version & info
nginx -V
ldd /usr/local/bin/nginx
