#!/usr/bin/env bash

SCRIPT_PATH="$(dirname "$(realpath "${BASH_SOURCE[0]}")")" # Absolute directory path this script is in
source "${SCRIPT_PATH}/0-1-base-apt.sh"

function gem-uninstall { gem uninstall -ax "$@"; }

function gem-clear {
  shopt -s nullglob
  rm -rf \
    /usr/local/lib/ruby/gems/*/cache/ \
    /usr/share/jruby/lib/ruby/gems/*/cache/ \
    /root/.gem/
  shopt -u nullglob # clear gem cache
}

function ruby-path-clear {
  # clear directory
  find "$1" \
    -type d \( \
      -iname ".*" \
      -or -iname "doc" -or -iname "docs" \
      -or -iname "example" -or -iname "examples" \
      -or -iname "coverage" \
      -or -iname "tmp" \
    \) -print -exec rm -rf {} +

  # clear file
  find "$1" \
    -type f \( \
      -iname ".*" \
      -or -iname "*.md" -or -iname "*.mkd" -or -iname "*.markdown" \
      -or -iname "*.rdoc" \
      -or -iname "readme" \
      -or -iname "*.c" -or -iname "*.cc" -or -iname "*.cpp" -or -iname "*.h" \
      -or -iname "*.bat" -or -iname "*.cmd" \
      -or -iname "makefile" -or -iname "configure" \
      -or -iname "changelog" -or -iname "changes" \
      -or -iname "authors" -or -iname "contributors" \
    \) -print -delete
}
