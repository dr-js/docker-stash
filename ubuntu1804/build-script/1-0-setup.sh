#!/usr/bin/env bash

source ./0-0-base.sh

# use cn source
if [[ "${DOCKER_BUILD_IS_CN_MIRROR}" = "true" ]] ; then
cat > /etc/apt/sources.list <<- 'EOM'
  # https://mirrors.tuna.tsinghua.edu.cn/help/ubuntu/
  # 18.04 LTS
  deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ bionic main restricted universe multiverse
  deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ bionic-updates main restricted universe multiverse
  deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ bionic-backports main restricted universe multiverse
  deb https://mirrors.tuna.tsinghua.edu.cn/ubuntu/ bionic-security main restricted universe multiverse
EOM
fi

apt-update
apt-install tar gzip
apt-install less htop nano
# apt-install zip p7zip-full # not so common
apt-clear
