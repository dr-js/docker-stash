#!/usr/bin/env bash

source ./0-1-base-apt.sh

{ # patch for git HTTP2 error: `unable to access 'https://github.com/{user}/{repo}/': Failed sending HTTP2 data`
  # check: https://superuser.com/questions/1642858/git-throws-fatal-unable-to-access-https-github-com-user-repo-git-failed-se
  # and: https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=987188
  echo 'Package: libcurl3-gnutls'
  echo 'Pin: version 7.64.*'
  echo 'Pin-Priority: 1001'
} > /etc/apt/preferences.d/git-curl-ci-patch

apt-update
  # TODO: the size increase is big (~70MiB), consider trim git-core/perl?
  apt-install git
apt-clear

# log version & info
git --version
