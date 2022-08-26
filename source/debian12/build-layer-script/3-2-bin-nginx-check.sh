#!/usr/bin/env bash

# log version & info
nginx -V
ldd "$(which nginx)"
ls -lh "$(which nginx)"
