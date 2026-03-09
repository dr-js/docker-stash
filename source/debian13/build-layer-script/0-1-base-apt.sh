#!/usr/bin/env bash

SCRIPT_PATH="$(dirname "$(realpath "${BASH_SOURCE[0]}")")" # Absolute directory path this script is in
source "${SCRIPT_PATH}/0-0-base.sh"

# https://github.com/moby/moby/issues/16058#issuecomment-334370727
# http://www.microhowto.info/howto/perform_an_unattended_installation_of_a_debian_package.html
function apt-update { DEBIAN_FRONTEND=noninteractive apt-get update -yq; }

function apt-install {
  DEBIAN_FRONTEND=noninteractive apt-get install -yq --no-install-recommends \
    -o Dpkg::Options::="--force-confdef" \
    -o Dpkg::Options::="--force-confold" \
    "$@"
}

function apt-remove {
  DEBIAN_FRONTEND=noninteractive apt-get remove -yq \
    -o Dpkg::Options::="--force-confdef" \
    -o Dpkg::Options::="--force-confold" \
    "$@"
}

# https://askubuntu.com/questions/628407/removing-man-pages-on-ubuntu-docker-installation
# https://unix.stackexchange.com/questions/2027/how-do-i-minimize-disk-space-usage
function apt-clear {
  DEBIAN_FRONTEND=noninteractive apt-get autoremove -yq --purge \
    -o APT::AutoRemove::RecommendsImportant=false

  shopt -s nullglob
  find /var/lib/dpkg/*-old -not -name lock -type f -delete
  find /usr/share/doc -not -name copyright -type f -delete
  find /usr/share/doc -not -name copyright -type l -delete
  find /usr/share/doc -type d -empty -delete
  rm -rf /usr/share/man/*
  rm -rf /usr/share/info/*
  shopt -u nullglob
}
