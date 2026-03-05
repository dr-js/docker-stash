#!/usr/bin/env bash

source ./0-1-base-apt.sh

apt-update
  apt-install \
    rsyslog logrotate $(: "for logging")
apt-clear

# log version & info
rsyslogd -v
logrotate --version
