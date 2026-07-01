#!/usr/bin/env bash

source ./0-1-base-apt.sh

RES_LAYER=./9-3-slim-pgsql18

# MNT
MNT_DEB_LIBPQ5="$(echo /mnt/build-layer-resource/libpq5_*_${DOCKER_BUILD_ARCH}.deb)"
MNT_DEB_PGCCMN="$(echo /mnt/build-layer-resource/postgresql-client-common_*_all.deb)"
MNT_DEB_PGC18="$(echo /mnt/build-layer-resource/postgresql-client-18_*_${DOCKER_BUILD_ARCH}.deb)"
MNT_DEB_PGCMN="$(echo /mnt/build-layer-resource/postgresql-common_*_all.deb)"
MNT_DEB_PG18="$(echo /mnt/build-layer-resource/postgresql-18_*_${DOCKER_BUILD_ARCH}.deb)"

# edited from Docker Official Image: https://github.com/docker-library/postgres/blob/dc8f7ae06a43a6c9647d9b7ca3b270bd148307fb/18/trixie/
cp -r "${RES_LAYER}"/* /
chmod +x /usr/local/bin/docker-entrypoint.sh
chmod +x /usr/local/bin/docker-ensure-initdb.sh

# add `postgres` user & group, use `999` as uid&gid to match: https://hub.docker.com/_/postgres/
groupadd --system --gid 999 postgres
useradd --system --gid 999 --uid 999 --home-dir=/var/lib/postgresql --shell=/bin/bash --comment "PostgreSQL Server" postgres
install --verbose --directory --owner postgres --group postgres --mode 1777 /var/lib/postgresql

# EDIT: use "C.UTF-8" instead of "en_US.UTF-8" locale

apt-update
  dpkg -i "${MNT_DEB_LIBPQ5}" || apt-install --fix-broken # fix missing dependencies
  dpkg -i "${MNT_DEB_PGCCMN}" || apt-install --fix-broken # fix missing dependencies
  dpkg -i "${MNT_DEB_PGC18}" || apt-install --fix-broken # fix missing dependencies
  dpkg -i "${MNT_DEB_PGCMN}" || apt-install --fix-broken # fix missing dependencies
  sed -ri 's/#(create_main_cluster) .*$/\1 = false/' /etc/postgresql-common/createcluster.conf # skip 'create_main_cluster'
  dpkg -i "${MNT_DEB_PG18}" || apt-install --fix-broken # fix missing dependencies
  # EDIT: skip install `postgresql-18-jit`, which pulls in ~100MB `libllvm19`
apt-clear

ldd-chk /usr/lib/postgresql/18/bin/postgres
ldd-chk /usr/lib/postgresql/18/bin/pg_dump
ldd-chk /usr/lib/postgresql/18/bin/psql

mkdir /docker-entrypoint-initdb.d

PG_MAJOR=18
PATH="$PATH:/usr/lib/postgresql/$PG_MAJOR/bin"

postgres --version

# make the sample config easier to munge (and "correct by default")
dpkg-divert --add --rename --divert "/usr/share/postgresql/postgresql.conf.sample.dpkg" "/usr/share/postgresql/$PG_MAJOR/postgresql.conf.sample"
cp -v /usr/share/postgresql/postgresql.conf.sample.dpkg /usr/share/postgresql/postgresql.conf.sample
ln -sv ../postgresql.conf.sample "/usr/share/postgresql/$PG_MAJOR/"
sed -ri "s!^#?(listen_addresses)\s*=\s*\S+.*!\1 = '*'!" /usr/share/postgresql/postgresql.conf.sample
grep -F "listen_addresses = '*'" /usr/share/postgresql/postgresql.conf.sample

install --verbose --directory --owner postgres --group postgres --mode 3777 /var/run/postgresql

ln -sT docker-ensure-initdb.sh /usr/local/bin/docker-enforce-initdb.sh

# log version & info
id postgres
postgres --version
pg_dump --version
psql --version
