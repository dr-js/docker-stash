#!/usr/bin/env bash

source ./0-1-base-apt.sh

apt-update
  apt-install \
    rsyslog logrotate $(: "for logging")
apt-clear

# log version & info
set -o pipefail
rsyslogd -v | sed -n '1p'
logrotate --version | sed -n '1p'
