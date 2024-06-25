# docker-stash

[![i:ci]][l:ci]

A collection of strange docker scripts

[i:ci]: https://img.shields.io/github/actions/workflow/status/dr-js/docker-stash/.github/workflows/ci-tag-build.yml
[l:ci]: https://github.com/dr-js/docker-stash/actions?query=workflow:ci-tag-build

[//]: # (NON_PACKAGE_CONTENT)

Docker Image Registry:
- [ghcr.io/dr-js/debian](https://ghcr.io/dr-js/debian)
- [drjs/debian](https://hub.docker.com/r/drjs/debian)

Image layer is checked with [dive](https://github.com/wagoodman/dive)

Require enable Docker experimental:
- Docker Linux: edit both `/etc/docker/daemon.json` and possibly `/root/.docker/config.json`
  - https://github.com/docker/docker-ce/blob/master/components/cli/experimental/README.md
  - https://github.com/docker/cli/issues/947
- Docker Desktop: check settings

Require enable Docker BuildKit:
- for faster build, use `npm run docker-pre-pull-buildkit` to pre-pull to local
- Docker Linux: edit `/etc/docker/daemon.json`
  - https://docs.docker.com/develop/develop-images/build_enhancements/#to-enable-buildkit-builds
- Docker Desktop: check settings
- related usage:
  - https://github.com/moby/buildkit/blob/master/frontend/dockerfile/docs/experimental.md
  - https://docs.docker.com/develop/develop-images/build_enhancements/#to-enable-buildkit-builds
  - https://stackoverflow.com/questions/26050899/how-to-mount-host-volumes-into-docker-containers-in-dockerfile-during-build/52762779#52762779

Basically for Linux, run:
```shell
cat /etc/docker/daemon.json
echo '{ "experimental": true, "features": { "buildkit": true } }' > sudo tee /etc/docker/daemon.json
```

#### build concept

The build has layered setup to add each feature `layer` on top of prev image `layer`,
  and an initial `core` image.

Each build will assemble a build folder with `Dockerfile` (the context).

For small file changes, expect only the changed layer and after layer get rebuild,
  currently all layer will get rebuild in CI due to cache is reset every time.

Most build resource file is cached locally,
  or in buildx-cache for faster dev rebuild.

Current layer stack:
```
debian:11-core
└─node
  └─bin-common
    ├─dep-build (big layer with C/C++ compiler tools +200MiB)
    └─bin-sshd
      └─bin-nginx
        └─bin-git
          └─bin-etc (layer from here & above is light, layer below will add 50MiB+ each)
            └─fluent-bit
              └─dep-chrome
                └─dep-font
                  ├─node-pptr2206
                  └─java
                    ├─ruby
                    | └─ruby-go
                    └─ruby3
                      └─ruby3-go
```

```
debian:12-core
└─node
  └─bin-common
    ├─dep-build (big layer with C/C++ compiler tools +200MiB)
    └─bin-sshd
      └─bin-nginx
        └─bin-git
          └─bin-etc (layer from here & above is light, layer below will add 50MiB+ each)
            └─fluent-bit
              └─dep-chrome
                └─dep-font
                  ├─node-pptr2208
                  └─java
                    ├─ruby2
                    | └─ruby2-go
                    └─ruby3
                      └─ruby3-go
```


#### build `debian11`

First create config file `source/debian11/BUILD_REPO.json`
  and `source/debian11/BUILD_REPO_GHCR.json`.

For this repo it's created with: (check the [CI file](.github/workflows/ci-tag-build.yml))
```
echo '"drjs/debian"' > source/debian11/BUILD_REPO.json
echo '"ghcr.io/dr-js/debian"' > source/debian11/BUILD_REPO_GHCR.json
```

Then run:
```shell script
npm run build-debian11
```

Use `build-proxy*` for slow fetch, the config can also be added in `.npmrc` like:
```
noproxy=127.0.0.1,localhost # exclude localhost
proxy=http://127.0.0.1:1080 # for http
https-proxy=http://127.0.0.1:1080 # for https
```
