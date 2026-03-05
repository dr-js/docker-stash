# break log

keep list of notable break & big code change

- `0.5.0-dev.1`
  - BREAK: layer: mass sort layer order & name
  - DEV-BREAK: layer: bin-git: install base git without perl for size reduce
- `0.5.0-dev.0`
  - BREAK: layer: reorder & provide `pptr2603|dep-chromium-headless-shell`
  - DEV-BREAK: layer: move `rsync` to `bin-common`
  - BREAK: layer: use `fluent-but@4`
  - BREAK: `trixie <- bookworm` and `13 <- 12`
  - BREAK: layer: bin-common: drop `wget|vim-tiny`
  - BREAK: sort repo dev pkg
- `0.4.4-dev.2`
  - DEV-BREAK: BUMP: layer package update
- `0.4.4-dev.1`
  - CHG: layer: ruby3: build yjit & use gem@3.7.2
- `0.4.4-dev.0`
  - BREAK: layer: `node-pptr2506 <- 2206`, with `pptr-core@24.10.0`
  - BREAK: layer: set `java` base to `fluent-bit`
  - BREAK: layer: `deb-browser <- dep-chrome` & install chromium+firefox
  - BREAK: DEL: layer: drop `ruby2` related layer
  - DEV-BREAK: layer: node install from official .txz instead of .deb
  - DEV-BREAK: ci: use github action for arm64 build & add manifest push step
  - CHG: layer: add `ping` to `3-0-bin-common.sh`
- `0.4.3`
  - core: support deb822 style config
  - layer: ruby3: lock gem&bundler verison
- `0.4.2`
  - layer: bin-nginx: build with `http_auth_request_module`
- `0.4.0`
  - break: del: drop debian11 build script
  - chg: layer: move `ruby(3)-go < go`
  - add: layer: ruby2* to deb12 to match layer stack
  - add: layer: fluent-bit
- `0.3.0` - placeholder
- `0.2.0` - placeholder
- `0.1.0` - placeholder
