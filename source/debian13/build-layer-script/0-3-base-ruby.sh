#!/usr/bin/env bash

SCRIPT_PATH="$(dirname "$(realpath "${BASH_SOURCE[0]}")")" # Absolute directory path this script is in
source "${SCRIPT_PATH}/0-1-base-apt.sh"

function gem-uninstall { gem uninstall -ax "$@"; }

function gem-clear {
  shopt -s nullglob
  rm -rf \
    /usr/local/lib/ruby/gems/*/cache/ \
    /root/.gem/
  shopt -u nullglob # clear gem cache
}
