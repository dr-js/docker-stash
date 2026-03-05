#!/usr/bin/env bash

source ./0-1-base-apt.sh

apt-update
  apt-install openssh-server systemd-standalone-sysusers
apt-clear

# log version & info
ssh -V
sshd -V || true # sshd do not have a "version" option
