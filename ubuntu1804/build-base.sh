#!/usr/bin/env bash

cd "$( dirname "${BASH_SOURCE[0]}" )" # Reset to path this script is in

BUILD_VERSION="$(cat ../BUILD_VERSION)"
BUILD_TAG="${BUILD_VERSION}-1804-base"

# borrow file from `https://hub.docker.com/_/ubuntu`
curl -L -o "config-base/Dockerfile" \
  "https://github.com/tianon/docker-brew-ubuntu-core/raw/dist-amd64/bionic/Dockerfile"
curl -L -o "config-base/ubuntu-bionic-core-cloudimg-amd64-root.tar.gz" \
  "https://github.com/tianon/docker-brew-ubuntu-core/raw/dist-amd64/bionic/ubuntu-bionic-core-cloudimg-amd64-root.tar.gz"

# append extra steps
cat config-base/Dockerfile.extra >> config-base/Dockerfile

mkdir ../output-gitignore/

docker image build \
 --tag "drjs/ubuntu:${BUILD_TAG}" \
 --file ./config-base/Dockerfile \
 --squash \
 ./config-base/ \
 | tee "../output-gitignore/${BUILD_TAG}.log"

# clean up
rm config-base/Dockerfile
rm config-base/ubuntu-bionic-core-cloudimg-amd64-root.tar.gz
