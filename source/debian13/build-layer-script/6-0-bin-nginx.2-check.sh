#!/usr/bin/env bash

source ./0-0-base.sh

ls -lh "$(which nginx)"

if ldd /usr/local/bin/nginx | grep "not found"
then ldd /usr/local/bin/nginx && false # log what's wrong & return error
else echo "[ldd pass: nginx]"
fi

# log version & info
nginx -V
