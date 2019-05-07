#!/usr/bin/env bash

cd "$( dirname "${BASH_SOURCE[0]}" )" # Reset to path this script is in

BUILD_VERSION="$(cat ../BUILD_VERSION)"
BUILD_FLAVOR="ruby"
BUILD_TAG="${BUILD_VERSION}-1804-${BUILD_FLAVOR}-cn"

mkdir -p ../output-gitignore/

docker image build \
 --tag "drjs/ubuntu:${BUILD_TAG}" \
 --file "./config/${BUILD_FLAVOR}/Dockerfile" \
 --build-arg BUILD_VERSION="${BUILD_VERSION}" \
 --build-arg DOCKER_BUILD_MIRROR="CN" \
 ./shared/ \
 | tee "../output-gitignore/${BUILD_TAG}.log"
