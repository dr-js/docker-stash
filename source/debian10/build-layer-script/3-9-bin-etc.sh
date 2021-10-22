#!/usr/bin/env bash

source ./0-1-base-apt.sh

apt-update
  apt-install \
    rsync $(: "for data backup") \
    rsyslog logrotate $(: "for logging")
apt-clear

# log version & info
rsync --version
rsyslogd -v
logrotate --version