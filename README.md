# docker-stash

[![i:ci]][l:ci]

A collection of strange docker scripts

[i:ci]: https://github.com/dr-js/docker-stash/workflows/ci-test/badge.svg
[l:ci]: https://github.com/dr-js/docker-stash/actions?query=workflow:ci-test

[//]: # (NON_PACKAGE_CONTENT)

Docker Image Registry:
- [ghcr.io/dr-js/debian](https://ghcr.io/dr-js/debian)
- [drjs/debian](https://hub.docker.com/r/drjs/debian)
- [drjs/ubuntu](https://hub.docker.com/r/drjs/ubuntu) [depecated]

Image layer is checked with [dive](https://github.com/wagoodman/dive)

Use Docker experimental:
- Desktop: check settings
- Linux: edit both `/etc/docker/daemon.json` and `/root/.docker/config.json`
  - https://github.com/docker/docker-ce/blob/master/components/cli/experimental/README.md
  - https://github.com/docker/cli/issues/947

Use Docker BuildKit:
- for faster build, pre-pull `docker image pull "$(node -p "require('./source/debian10/BUILDKIT_SYNTAX.json')")"` to local
- Desktop: check settings
- Linux: edit `/etc/docker/daemon.json`
  - https://docs.docker.com/develop/develop-images/build_enhancements/#to-enable-buildkit-builds
- related usage:
  - https://github.com/moby/buildkit/blob/master/frontend/dockerfile/docs/experimental.md
  - https://docs.docker.com/develop/develop-images/build_enhancements/#to-enable-buildkit-builds
  - https://stackoverflow.com/questions/26050899/how-to-mount-host-volumes-into-docker-containers-in-dockerfile-during-build/52762779#52762779

#### build step

The build has layered setup to add each feature `layer` on top of prev image `layer`,
  and an initial `core` image.

Each build will assemble a build folder with `Dockerfile` (the context).

Try not to frequently rebuild the `core` after `layer` is built,
  this will cause all `layer` to also do full rebuild.

#### build `debian10`

First check `source/debian10/BUILD_REPO.json`

Then run:
```shell script
npm run build-debian10

# or for CN mirror
npm run build-debian10-cn
npm run build-debian10-cn-proxy
```

Use `build-proxy*` for slow fetch
