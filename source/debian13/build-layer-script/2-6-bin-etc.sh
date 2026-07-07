#!/usr/bin/env bash

source ./0-1-base-apt.sh

apt-update
  apt-install \
    socat \
    rsyslog logrotate $(: "for logging")
apt-clear

# log version & info
socat -V | sed -n '1,2p'
rsyslogd -v | sed -n '1p'
logrotate --version | sed -n '1p'
