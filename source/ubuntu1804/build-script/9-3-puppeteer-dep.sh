#!/usr/bin/env bash

source ./0-0-base.sh

# TODO: the size increase is big (~70MiB), consider trim `/usr/share/icons/`?

apt-update
apt-install libgtk-3-0 libx11-xcb1 libxrandr2 libasound2 libxss1 libnss3 libxtst6
apt-clear
