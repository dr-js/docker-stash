#!/usr/bin/env bash

source ./0-1-base-apt.sh

RES_LAYER=./9-0-slim-mysql84

# MNT
MNT_DEB_LIBTCMM4="$(echo /mnt/build-layer-resource/libtcmalloc-minimal4t64_*_${DOCKER_BUILD_ARCH}.deb)"
MNT_DEB_LIBGGPT4="$(echo /mnt/build-layer-resource/libgoogle-perftools4t64_*_${DOCKER_BUILD_ARCH}.deb)"
MNT_DEB_MYSQL_CLI="$(echo /mnt/build-layer-resource/mysql-client-core_*_${DOCKER_BUILD_ARCH}.deb)"
MNT_DEB_LIBICU="$(echo /mnt/build-layer-resource/libicu78_*_${DOCKER_BUILD_ARCH}.deb)"
MNT_DEB_MYSQL_SVR="$(echo /mnt/build-layer-resource/mysql-server-core_*_${DOCKER_BUILD_ARCH}.deb)"

apt-update
  dpkg -i "${MNT_DEB_LIBTCMM4}" || apt-install --fix-broken # fix missing dependencies
  dpkg -i "${MNT_DEB_LIBGGPT4}" || apt-install --fix-broken # fix missing dependencies
  dpkg -i "${MNT_DEB_MYSQL_CLI}" || apt-install --fix-broken # fix missing dependencies
  dpkg -i "${MNT_DEB_LIBICU}" || apt-install --fix-broken # fix missing dependencies
  dpkg -i "${MNT_DEB_MYSQL_SVR}" || apt-get -o Debug::pkgProblemResolver=yes install --fix-broken # fix missing dependencies # TODO: need libc6 (>= 2.42) but trixie only have libc6 (2.41-12+deb13u3)
apt-clear

# edited from Docker Official Image: https://github.com/docker-library/mysql/blob/99f090f89830dbd679771884e723c0f74bec0b29/8.4/
cp -r "${RES_LAYER}"/* /
chmod +x /usr/local/bin/docker-entrypoint.sh

# add `mysql` user & group, use `999` as uid&gid to match: https://hub.docker.com/_/mysql/
groupadd --system --gid 999 mysql
useradd --system --gid 999 --uid 999 --no-create-home --home-dir /nonexistent --shell /bin/false --comment "MySQL Server" mysql

mkdir /docker-entrypoint-initdb.d/ /var/lib/mysql/ /var/run/mysqld/
chown mysql:mysql /var/lib/mysql /var/run/mysqld
chmod 1777 /var/lib/mysql # make data dir writable for all user

ldd-chk /usr/bin/mysql
ldd-chk /usr/bin/mysqldump
ldd-chk /usr/sbin/mysqld

# log version & info
id mysql
mysql --version
mysqldump --version
mysqld --version
