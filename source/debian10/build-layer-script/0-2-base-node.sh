#!/usr/bin/env bash

SCRIPT_PATH="$(dirname "$(realpath "${BASH_SOURCE[0]}")")" # Absolute directory path this script is in
source "${SCRIPT_PATH}/0-1-base-apt.sh"

# from: https://github.com/tj/node-prune/blob/v1.2.0/internal/prune/prune.go
# also: https://superuser.com/questions/126290/find-files-filtered-by-multiple-extensions
function node-path-clear {
  # clear directory
  find "$1" -type d \
    \( \( $(: "pattern to keep") \
      ! -iname ".bin" $(: "bin alias folder") \
      -and ! -iname ".local-chromium" $(: "puppeteer local download") \
    \) -and \( $(: "pattern to remove") \
      -iname ".*" \
      -or -iname "__tests__" -or -iname "test" -or -iname "tests" -or -iname "powered-test" \
      -or -iname "doc" -or -iname "docs" \
      -or -iname "example" -or -iname "examples" \
      -or -iname "coverage" \
      $(: "trim for specific package") \
      -or -ipath "*/ajv/dist" \
      -or -ipath "*/bluebird/js/browser" \
      -or -ipath "*/uri-js/dist/esnext" \
    \) \) -print -exec rm -rf {} +

  # clear file
  find "$1" -type f \
    \( $(: "pattern to remove") \
      -iname ".*" \
      -or -iname "*.md" -or -iname "*.mkd" -or -iname "*.markdown" \
      -or -iname "*.test.js" -or -iname "*.spec.js" \
      -or -iname "*.conf.js" -or -iname "*.config.js" -or -iname "*.config.json" \
      -or -iname "*.ts" -or -iname "*.jst" -or -iname "*.coffee" \
      -or -iname "*.map" \
      -or -iname "*.css" -or -iname "*.html" \
      -or -iname "*.tgz" -or -iname "*.swp" \
      -or -iname "*.c" -or -iname "*.cc" -or -iname "*.cpp" -or -iname "*.h" \
      -or -iname "*.bat" -or -iname "*.cmd" \
      -or -iname "makefile" -or -iname "configure" \
      -or -iname "changelog" -or -iname "changes" \
      -or -iname "authors" -or -iname "contributors" \
      -or -iname "package-lock.json" -or -iname "yarn.lock" \
    \) -print -delete
}
