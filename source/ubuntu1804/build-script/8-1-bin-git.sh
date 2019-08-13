#!/usr/bin/env bash

source ./0-0-base.sh

# TODO: the size increase is big (~70MiB), consider trim git-core/perl?

apt-update
apt-install git
apt-clear
