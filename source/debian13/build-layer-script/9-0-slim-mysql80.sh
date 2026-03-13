#!/usr/bin/env bash

source ./0-1-base-apt.sh

RES_LAYER=./9-0-slim-mysql80

# MNT
MNT_DEB_MYSQL_CMN="$(echo /mnt/build-layer-resource/mysql-common_*_all.deb)"
MNT_DEB_MYSQL_CLI="$(echo /mnt/build-layer-resource/mysql-client-core-8.0_*_${DOCKER_BUILD_ARCH}.deb)"
MNT_DEB_LIBICU="$(echo /mnt/build-layer-resource/libicu74_*_${DOCKER_BUILD_ARCH}.deb)"
MNT_DEB_MYSQL_SVR="$(echo /mnt/build-layer-resource/mysql-server-core-8.0_*_${DOCKER_BUILD_ARCH}.deb)"

apt-update
  dpkg -i "${MNT_DEB_MYSQL_CMN}"
  dpkg -i "${MNT_DEB_MYSQL_CLI}" || apt-install --fix-broken # fix missing dependencies
  dpkg -i "${MNT_DEB_LIBICU}" || apt-install --fix-broken # fix missing dependencies
  dpkg -i "${MNT_DEB_MYSQL_SVR}" || apt-install --fix-broken # fix missing dependencies
apt-clear

cp -r "${RES_LAYER}"/* /
chmod +x /usr/local/bin/docker-entrypoint.sh

# add `mysql` user & group, use `999` as uid&gid to match: https://hub.docker.com/_/mysql/
groupadd --system --gid 999 mysql
useradd --system --gid 999 --uid 999 --no-create-home --home-dir /nonexistent --shell /bin/false --comment "MySQL Server" mysql

mkdir /docker-entrypoint-initdb.d/ /var/lib/mysql/ /var/run/mysqld/
chown mysql:mysql /var/lib/mysql /var/run/mysqld
chmod 1777 /var/lib/mysql # make data dir writable for all user

if ldd /usr/bin/mysql | grep "not found"
then ldd /usr/bin/mysql && false # log what's wrong & return error
else echo "[ldd pass: mysql]"
fi
if ldd /usr/bin/mysqldump | grep "not found"
then ldd /usr/bin/mysqldump && false # log what's wrong & return error
else echo "[ldd pass: mysqldump]"
fi
if ldd /usr/sbin/mysqld | grep "not found"
then ldd /usr/sbin/mysqld && false # log what's wrong & return error
else echo "[ldd pass: mysqld]"
fi

# log version & info
id mysql
mysql --version
mysqldump --version
mysqld --version
