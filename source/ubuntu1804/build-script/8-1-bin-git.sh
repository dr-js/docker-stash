#!/usr/bin/env bash

source ./0-0-base.sh

apt-update
  # TODO: the size increase is big (~70MiB), consider trim git-core/perl?
  apt-install git
apt-clear
