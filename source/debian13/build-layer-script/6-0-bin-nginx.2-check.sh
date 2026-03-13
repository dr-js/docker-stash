#!/usr/bin/env bash

source ./0-0-base.sh

ls -lh "$(which nginx)"
ldd-chk "$(which nginx)"

# log version & info
nginx -V
