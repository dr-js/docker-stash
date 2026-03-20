# docker-stash

[![i:ci]][l:ci]

A collection of strange docker scripts

[i:ci]: https://img.shields.io/github/actions/workflow/status/dr-js/docker-stash/.github/workflows/ci-on-tag.yml
[l:ci]: https://github.com/dr-js/docker-stash/actions?query=workflow:ci-on-tag

[//]: # (NON_PACKAGE_CONTENT)

Docker Image Registry:
- [ghcr.io/dr-js/debian](https://ghcr.io/dr-js/debian)
- [drjs/debian](https://hub.docker.com/r/drjs/debian)

Image layer is checked with [dive](https://github.com/wagoodman/dive)

Expect `docker@24+` with BuildKit enabled by default

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
debian:13-core (80M uncompressed)
└─bin-common (35M)
  ├─bin-node (135M)
  | └─bin-sshd (10M)
  |   └─bin-etc (3M)
  |     └─bin-git (35M)
  |       ├─bin-ruby3 (75M)
  |       | └─bin-java (210M)
  |       |   └─dep-libvips (90M)
  |       |     ├─bin-go (210M)
  |       |     | └─bin-build (230M) ┈┈┬┈┈┈┈┈┈┈┈╮ used to build
  |       |     └─bin-nginx (2M) ⏴┈┈┈┈┈╯        ┊
  |       |       └─bin-fluent-bit (70M)        ┊
  |       └─dep-font (155M)                     ┊
  |         └─dep-pptr2603 (20M)                ┊
  |           └─bin-chrome-hlsh (225M)          ┊
  |             └─bin-firefox (390M)            ┊
  ├─slim-nginx (2M) ⏴┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┤
  ├─slim-mysql80 (225M)                         ┊
  | └─slim-mysql80-ci-only (45M)                ┊
  └─slim-redis6 (15M) ⏴┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈╯
```


#### build `debian13`

First create config file `source/debian13/BUILD_REPO.json`
  and `source/debian13/BUILD_REPO_GHCR.json`.

For this repo it's created with: (check the [CI file](.github/workflows/ci-on-tag.yml))
```
echo '"drjs/debian"' > source/debian13/BUILD_REPO.json
echo '"ghcr.io/dr-js/debian"' > source/debian13/BUILD_REPO_GHCR.json
```

Then run:
```shell script
npm run build-debian13
```

Use `build-proxy*` for slow fetch, the config can also be added in `.npmrc` like:
```
noproxy=127.0.0.1,localhost # exclude localhost
proxy=http://127.0.0.1:1080 # for http
https-proxy=http://127.0.0.1:1080 # for https
```


#### auth "ghcr.io" with PAT

For now the doc's quite twisted,
we need to use a Personal access token (PAT) to auth the "ghcr.io" repo,
and the setup will be as following:

The main doc (TLDR): https://docs.github.com/en/packages/learn-github-packages/introduction-to-github-packages,
and this section specifically: https://docs.github.com/en/packages/learn-github-packages/introduction-to-github-packages#authenticating-to-github-packages

The doc for creating a PAT (follow this): https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens,
and use the PAT to access the "ghcr.io" repo image, though proxy.

And to create a PAT with `write:packages` scope only, use this url: https://github.com/settings/tokens/new?scopes=write:packages ([REF](https://github.com/github/docs/issues/2660#issuecomment-810766203))
