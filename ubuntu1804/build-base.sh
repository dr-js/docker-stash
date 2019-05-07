#!/usr/bin/env bash

cd "$( dirname "${BASH_SOURCE[0]}" )" # Reset to path this script is in

BUILD_VERSION="$(cat ../BUILD_VERSION)"
BUILD_TAG="${BUILD_VERSION}-1804-base"

FILE_DOCKERFILE=./config/base/Dockerfile
FILE_CORE_IMAGE=./config/base/ubuntu-bionic-core-cloudimg-amd64-root.tar.gz

# borrow file from `https://hub.docker.com/_/ubuntu`
curl -L -o "${FILE_DOCKERFILE}" \
  "https://github.com/tianon/docker-brew-ubuntu-core/raw/dist-amd64/bionic/Dockerfile"
curl -L -o "${FILE_CORE_IMAGE}" \
  "https://github.com/tianon/docker-brew-ubuntu-core/raw/dist-amd64/bionic/ubuntu-bionic-core-cloudimg-amd64-root.tar.gz"
  # or: "https://partner-images.canonical.com/core/bionic/current/ubuntu-bionic-core-cloudimg-amd64-root.tar.gz"

# append extra steps
cat ./config/base/Dockerfile.extra >> "${FILE_DOCKERFILE}"

mkdir -p ../output-gitignore/

docker image build \
 --tag "drjs/ubuntu:${BUILD_TAG}" \
 --file "${FILE_DOCKERFILE}" \
 --squash \
 ./config/base/ \
 | tee "../output-gitignore/${BUILD_TAG}.log"

# clean up
rm "${FILE_DOCKERFILE}"
rm "${FILE_CORE_IMAGE}"
