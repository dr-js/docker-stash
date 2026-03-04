set -ex # expect `cwd` at repo root

sudo npm i -g @dr-js/core@0.5 @dr-js/dev@0.5
dr-dev -eI .github/ci-patch.js

# `ubuntu-24.04` should provide `docker@28` check: https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2404-Readme.md
docker --version

echo '"drjs/debian"' > source/debian12/BUILD_REPO.json
echo '"ghcr.io/dr-js/debian"' > source/debian12/BUILD_REPO_GHCR.json
