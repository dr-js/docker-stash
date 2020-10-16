#!/usr/bin/env bash

source ./0-0-base.sh

# use cn source
if [[ "${DOCKER_BUILD_MIRROR}" = "CN" ]] ; then
cat > /etc/apt/sources.list <<- 'EOM'
  # https://mirrors.tuna.tsinghua.edu.cn/help/debian/
  # debian 10 (buster)
  deb https://mirrors.tuna.tsinghua.edu.cn/debian/ buster main contrib non-free
  deb https://mirrors.tuna.tsinghua.edu.cn/debian/ buster-updates main contrib non-free
  deb https://mirrors.tuna.tsinghua.edu.cn/debian/ buster-backports main contrib non-free
  deb https://mirrors.tuna.tsinghua.edu.cn/debian-security buster/updates main contrib non-free
EOM
else
cat > /etc/apt/sources.list <<- 'EOM'
  # https://wiki.debian.org/SourcesList#Example_sources.list
  # debian 10 (buster)
  deb http://deb.debian.org/debian buster main contrib non-free
  deb http://deb.debian.org/debian buster-updates main contrib non-free
  deb http://deb.debian.org/debian buster-backports main contrib non-free
  deb http://deb.debian.org/debian-security/ buster/updates main contrib non-free
EOM
fi

apt-update
  apt-install tar gzip less htop nano
apt-clear
