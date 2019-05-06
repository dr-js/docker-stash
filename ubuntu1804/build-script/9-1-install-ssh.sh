#!/usr/bin/env bash

source ./0-0-base.sh

apt-update
apt-install openssh-server # with client
apt-clear
