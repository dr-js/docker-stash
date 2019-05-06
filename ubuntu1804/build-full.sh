#!/usr/bin/env bash

cd "$( dirname "${BASH_SOURCE[0]}" )" # Reset to path this script is in

BUILD_VERSION="$(cat ../BUILD_VERSION)"
BUILD_TAG="${BUILD_VERSION}-1804-full"

mkdir ../output-gitignore/

docker image build \
 --tag "drjs/ubuntu:${BUILD_TAG}" \
 --file ./config-full/Dockerfile \
 --build-arg BUILD_VERSION="${BUILD_VERSION}" \
 --build-arg IS_CN_MIRROR=false \
 ./build-script/ \
 | tee "../output-gitignore/${BUILD_TAG}.log"
