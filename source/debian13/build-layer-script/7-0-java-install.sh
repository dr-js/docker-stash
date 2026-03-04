#!/usr/bin/env bash

source ./0-1-base-apt.sh

apt-update
  mkdir -p /usr/share/man/man1/ # fix update-alternatives doesn't respect path-exclude # https://github.com/debuerreotype/docker-debian-artifacts/issues/24
  apt-install openjdk-17-jre-headless
  rm -rf /usr/share/man/man1/
apt-clear

# log version & info
java --version
