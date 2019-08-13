# docker-stash

A collection of strange docker scripts

DockerHub: [drjs/ubuntu](https://hub.docker.com/r/drjs/ubuntu)

Image layer is checked with [dive](https://github.com/wagoodman/dive)

Use Docker experimental:
- Desktop: check settings
- Linux: both `/etc/docker/daemon.json` and `$HOME/.docker/config.json`
  - https://github.com/docker/docker-ce/blob/master/components/cli/experimental/README.md
  - https://github.com/docker/cli/issues/947

#### build

First check `source/ubuntu1804/BUILD_REPO.json`

Then run
```bash
npm run build-ubuntu1804-core

npm run build-ubuntu1804-layer
# or for CN mirror
npm run build-ubuntu1804-layer-cn
```

#### build step

The build has layered setup to add each feature on top of prev image,
and an initial `core` image.

Each build will assemble a build folder with `Dockerfile` (the context).

Do not frequently rebuild the core after layer is built,
this will cause the layer to do full rebuild.
