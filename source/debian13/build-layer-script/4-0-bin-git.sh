#!/usr/bin/env bash

source ./0-1-base-apt.sh

apt-update
  # TODO: the size increase is big (~70MiB), consider trim git-core/perl?
  # apt-install git

  # TODO: hacky way to install base git without perl, keep only:
  #   - /usr/bin/git*
  #   - /usr/lib/git-core/
  # ref:
  #   - https://packages.debian.org/trixie/git
  #   - https://pkgs.alpinelinux.org/package/v3.23/main/x86_64/git
  mkdir /opt/tmp-git/
  apt-install git libcurl3t64-gnutls libexpat1 libpcre2-posix3 zlib1g
  rsync -a /usr/bin/git*      /opt/tmp-git/
  rsync -a /usr/lib/git-core/ /opt/tmp-git/usr-lib-git-core/
  apt-remove git # uninstall git but keep dep pkg
  mv /opt/tmp-git/usr-lib-git-core  /usr/lib/git-core
  mv /opt/tmp-git/git*              /usr/bin/
  rmdir /opt/tmp-git/
apt-clear

# log version & info
git --version
