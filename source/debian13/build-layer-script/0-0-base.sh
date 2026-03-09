#!/usr/bin/env bash

set -xe # enable shell command log & exit on error

function make-public-readable { chmod --recursive --changes a+rX "$@"; } # make all file readable (+r), and dir content accessible (+X)
function make-public-writable { chmod --recursive --changes a+rwX "$@"; } # make all file readable & writable (+rw), and dir content accessible (+X)
