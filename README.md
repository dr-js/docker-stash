# docker-stash

[![i:ci]][l:ci]

A collection of strange docker scripts

[i:ci]: https://github.com/dr-js/docker-stash/workflows/ci-test/badge.svg
[l:ci]: https://github.com/dr-js/docker-stash/actions?query=workflow:ci-test

[//]: # (NON_PACKAGE_CONTENT)

Docker Image Registry:
- [ghcr.io/dr-js/debian](https://ghcr.io/dr-js/debian)
- [drjs/debian](https://hub.docker.com/r/drjs/debian)

Image layer is checked with [dive](https://github.com/wagoodman/dive)

Require enable Docker experimental:
- Docker Linux: edit both `/etc/docker/daemon.json` and `/root/.docker/config.json`
  - https://github.com/docker/docker-ce/blob/master/components/cli/experimental/README.md
  - https://github.com/docker/cli/issues/947
- Docker Desktop: check settings

Require enable Docker BuildKit:
- for faster build, pre-pull `docker image pull "$(node -p "require('./source/debian10/BUILDKIT_SYNTAX.json')")"` to local
- Docker Linux: edit `/etc/docker/daemon.json`
  - https://docs.docker.com/develop/develop-images/build_enhancements/#to-enable-buildkit-builds
- Docker Desktop: check settings
- related usage:
  - https://github.com/moby/buildkit/blob/master/frontend/dockerfile/docs/experimental.md
  - https://docs.docker.com/develop/develop-images/build_enhancements/#to-enable-buildkit-builds
  - https://stackoverflow.com/questions/26050899/how-to-mount-host-volumes-into-docker-containers-in-dockerfile-during-build/52762779#52762779


#### build concept

The build has layered setup to add each feature `layer` on top of prev image `layer`,
  and an initial `core` image.

Each build will assemble a build folder with `Dockerfile` (the context).

For small file changes, expect only the changed layer and after layer get rebuild,
  currently all layer will get rebuild in CI due to cache is reset every time.

Most of build resource file is cached locally,
  or in buildx-cache for faster dev rebuild.

The `CN` version will change some repo mirror in docker for faster build in CN,
  but proxy will still help since the local resource file download will is still slow.

Current layer stack:
```
debian:10-core
└─node
  └─bin-common
    └─bin-sshd
      └─bin-nginx
        └─bin-git
          └─dep-chrome
            └─java
              ├─ruby
              └─jruby
```


#### build `debian10`

First create config file `source/debian10/BUILD_REPO.json`
  and `source/debian10/BUILD_REPO_GHCR.json`.

For this repo it's created with: (check the [CI file](.github/workflows/ci-tag-build.yml))
```
echo '"drjs/debian"' > source/debian10/BUILD_REPO.json
echo '"ghcr.io/dr-js/debian"' > source/debian10/BUILD_REPO_GHCR.json
```

Then run:
```shell script
npm run build-debian10

# or for CN mirror
npm run build-debian10-cn
npm run build-debian10-cn-proxy
```

Use `build-proxy*` for slow fetch, the config can also be in `.npmrc` like:
```
noproxy=127.0.0.1,localhost # exclude localhost
proxy=http://127.0.0.1:1080 # for http
https-proxy=http://127.0.0.1:1080 # for https
```
