#!/usr/bin/env bash

alias shell-ex-on='set -xe'
alias shell-ex-off='set +xe'

# https://github.com/moby/moby/issues/16058#issuecomment-334370727
# http://www.microhowto.info/howto/perform_an_unattended_installation_of_a_debian_package.html
alias apt-update='apt-get update -yq'
alias apt-install='DEBIAN_FRONTEND=noninteractive \
  apt-get install -yq --no-install-recommends \
    -o Dpkg::Options::="--force-confdef" \
    -o Dpkg::Options::="--force-confold"'
alias apt-remove='DEBIAN_FRONTEND=noninteractive \
  apt-get remove -yq \
    -o Dpkg::Options::="--force-confdef" \
    -o Dpkg::Options::="--force-confold"'
alias apt-clear='apt-get autoremove -yq --purge \
    -o APT::AutoRemove::RecommendsImportant=false \
  && shopt -s nullglob \
  && find /var/cache/apt/archives /var/lib/apt/lists /var/log /var/lib/dpkg/*-old /var/cache/debconf/*-old -not -name lock -type f -delete \
  && shopt -u nullglob'

shopt -s expand_aliases # or alias won't work # https://askubuntu.com/questions/98782/how-to-run-an-alias-in-a-shell-script

shell-ex-on # enable shell command log & exit on error
