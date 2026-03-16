#!/usr/bin/env bash

source ./0-1-base-apt.sh

RES_LAYER=./9-2-slim-redis6

cp -r "${RES_LAYER}"/* /
chmod +x /usr/local/bin/docker-entrypoint.sh

# add `redis` user & group, use `999` as uid&gid to match: https://hub.docker.com/_/redis/
groupadd --system --gid 999 redis
useradd --system --gid 999 --uid 999 --no-create-home --home-dir /nonexistent --shell /bin/false --comment "Redis Server" redis

mkdir /data
chown redis:redis /data

ldd-chk /usr/local/bin/redis-cli
ldd-chk /usr/local/bin/redis-server

# log version & info
id redis
redis-cli --version
redis-server --version
