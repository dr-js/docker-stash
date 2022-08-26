#!/usr/bin/env bash

source ./0-1-base-apt.sh

# MNT
MNT_TGZ_GO="$(echo /mnt/build-layer-resource/go*-${DOCKER_BUILD_ARCH}.tar.gz)"

# https://golang.org/doc/install#install
tar -C "/usr/local" -xzf "${MNT_TGZ_GO}"

# debian way of symlink
ln -sfT "/usr/local/go/bin/go" "/usr/bin/go"
ln -sfT "/usr/local/go/bin/gofmt" "/usr/bin/gofmt"

# log version & info
go version
gofmt --help
