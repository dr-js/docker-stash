#!/usr/bin/env bash

if [[ "${DOCKER_BUILD_MIRROR}" == "CN" ]]; then
  alias npm-install-global='npm install -g --registry=https://registry.npm.taobao.org'
else
  alias npm-install-global='npm install -g'
fi

function npm-clear() {
  npm cache clean --force

  # from: https://github.com/tj/node-prune/blob/master/prune.go
  # also: https://superuser.com/questions/126290/find-files-filtered-by-multiple-extensions
  find /usr/lib/node_modules/ \
    -type f \( \
      -iname ".*" \
      -o -iname "*.md" \
      -o -iname "*.mkd" \
      -o -iname "*.markdown" \
      -o -iname "*.css" \
      -o -iname "*.html" \
      -o -iname "*.test.js" \
      -o -iname "*.spec.js" \
      -o -iname "*.conf.js" \
      -o -iname "*.config.js" \
      -o -iname "*.config.json" \
      -o -iname "*.js.map" \
      -o -iname "*.ts" \
      -o -iname "*.jst" \
      -o -iname "*.coffee" \
      -o -iname "changelog" \
    \) -print -delete
  find /usr/lib/node_modules/ \
    -type d \( \
      -iname ".idea" \
      -o -iname ".vscode" \
      -o -iname ".github" \
      -o -iname ".circleci" \
      -o -iname ".nyc_output" \
      -o -iname "test" \
      -o -iname "tests" \
      -o -iname "doc" \
      -o -iname "docs" \
      -o -iname "example" \
      -o -iname "examples" \
      -o -iname "coverage" \
    \) -print -exec rm -rf {} +
}
