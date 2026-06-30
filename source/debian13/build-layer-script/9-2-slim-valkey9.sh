#!/usr/bin/env bash

source ./0-0-base.sh

RES_LAYER=./9-2-slim-valkey9

# MNT
MNT_TGZ_VLKY="$(echo /mnt/build-layer-resource/valkey-*-${DOCKER_BUILD_ARCH}.tar.gz)"

# edited from Docker Image: https://github.com/valkey-io/valkey-container/blob/mainline/9.1/debian/
# already has `tzdata libssl3t64` installed

mkdir /tmp/unpack/
( cd /tmp/unpack/
  tar -xf "${MNT_TGZ_VLKY}"
  mv ./valkey-*/bin/valkey-cli    /usr/local/bin/valkey-cli
  mv ./valkey-*/bin/valkey-server /usr/local/bin/valkey-server
)
rm -r /tmp/unpack/

cp -r "${RES_LAYER}"/* /
chmod +x /usr/local/bin/docker-entrypoint.sh

ln -sfT valkey-server /usr/local/bin/valkey-check-aof
ln -sfT valkey-server /usr/local/bin/valkey-check-rdb
ln -sfT valkey-server /usr/local/bin/valkey-sentinel

ln -sfT valkey-server /usr/local/bin/redis-check-aof
ln -sfT valkey-server /usr/local/bin/redis-check-rdb
ln -sfT valkey-cli    /usr/local/bin/redis-cli
ln -sfT valkey-server /usr/local/bin/redis-sentinel
ln -sfT valkey-server /usr/local/bin/redis-server

ls -al /usr/local/bin/

# add `valkey` user & group, use `999` as uid&gid to match: https://hub.docker.com/r/valkey/valkey and https://hub.docker.com/_/redis/
groupadd --system --gid 999 valkey
useradd --system --gid 999 --uid 999 --no-create-home --home-dir /nonexistent --shell /bin/false --comment "Valkey Server" valkey

mkdir /data
chown valkey:valkey /data
chmod 1777 /data
mkdir -p /run/valkey
chown valkey:valkey /run/valkey
chmod 1777 /run/valkey

ldd-chk /usr/local/bin/valkey-cli
ldd-chk /usr/local/bin/valkey-server

# log version & info
id valkey
valkey-cli --version
valkey-server --version
redis-cli --version # also check compat symlink
redis-server --version # also check compat symlink
