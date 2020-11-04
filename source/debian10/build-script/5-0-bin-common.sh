#!/usr/bin/env bash

source ./0-1-base-apt.sh

apt-update
  apt-install \
    less htop nano \
    tar gzip p7zip-full
apt-clear
