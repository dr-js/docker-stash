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

# https://askubuntu.com/questions/628407/removing-man-pages-on-ubuntu-docker-installation
# https://unix.stackexchange.com/questions/2027/how-do-i-minimize-disk-space-usage
alias apt-clear='apt-get autoremove -yq --purge \
    -o APT::AutoRemove::RecommendsImportant=false \
  && shopt -s nullglob \
  && find /var/cache/apt/archives /var/lib/apt/lists /var/log /var/lib/dpkg/*-old /var/cache/debconf/*-old -not -name lock -type f -delete \
  && find /usr/share/doc -not -name copyright -type f -delete \
  && find /usr/share/doc -not -name copyright -type l -delete \
  && find /usr/share/doc -type d -empty -delete \
  && rm -rf /usr/share/man/* \
  && rm -rf /usr/share/info/* \
  && shopt -u nullglob'

shopt -s expand_aliases # or alias won't work # https://askubuntu.com/questions/98782/how-to-run-an-alias-in-a-shell-script

shell-ex-on # enable shell command log & exit on error
