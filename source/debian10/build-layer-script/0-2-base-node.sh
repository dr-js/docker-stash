#!/usr/bin/env bash

SCRIPT_PATH="$(dirname "$(realpath "${BASH_SOURCE[0]}")")" # Absolute directory path this script is in
source "${SCRIPT_PATH}/0-1-base-apt.sh"

# from: https://github.com/tj/node-prune/blob/v1.2.0/internal/prune/prune.go
# also: https://superuser.com/questions/126290/find-files-filtered-by-multiple-extensions
function node-path-clear {
  # clear directory
  find "$1" \
    -type d \( \
      -iname ".*" \
      -o -iname "__tests__" -o -iname "test" -o -iname "tests" -o -iname "powered-test" \
      -o -iname "doc" -o -iname "docs" \
      -o -iname "example" -o -iname "examples" \
      -o -iname "coverage" \
    \) -print -exec rm -rf {} +

  # clear file
  find "$1" \
    -type f \( \
      -iname ".*" \
      -o -iname "*.md" -o -iname "*.mkd" -o -iname "*.markdown" \
      -o -iname "*.test.js" -o -iname "*.spec.js" \
      -o -iname "*.conf.js" -o -iname "*.config.js" -o -iname "*.config.json" \
      -o -iname "*.ts" -o -iname "*.jst" -o -iname "*.coffee" \
      -o -iname "*.js.map" \
      -o -iname "*.css" -o -iname "*.html" \
      -o -iname "*.tgz" -o -iname "*.swp" \
      -o -iname "*.c" -o -iname "*.cc" -o -iname "*.cpp" -o -iname "*.h" \
      -o -iname "changelog" -o -iname "changes" \
      -o -iname "authors" -o -iname "contributors" \
      -o -iname "package-lock.json" -o -iname "yarn.lock" \
    \) -print -delete
}
