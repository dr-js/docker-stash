#!/usr/bin/env bash

source ./0-1-base-apt.sh

apt-update
  # TODO: the size increase is big (~70MiB), consider trim git-core/perl?
  apt-install git
apt-clear

# log version & info
git --version
