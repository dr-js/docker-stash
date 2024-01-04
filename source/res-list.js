const DEB11_FETCH_LIST = [
  // update at 2023/10/24, to find download start from: https://packages.debian.org/search?keywords=ca-certificates
  [ 'https://ftp.debian.org/debian/pool/main/c/ca-certificates/ca-certificates_20210119_all.deb '.trim(), 'b2d488ad4d8d8adb3ba319fc9cb2cf9909fc42cb82ad239a26c570a2e749c389' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/openssl_1.1.1w-0+deb11u1_amd64.deb       '.trim(), '04873d74cbe86bad3a9901f6e57f1150040eba9891b443c5c975a72a97238e35' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/openssl_1.1.1w-0+deb11u1_arm64.deb       '.trim(), 'd9159af073e95641e7eda440fa1d7623873b8c0034c9826a353f890bed107f3c' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/libssl1.1_1.1.1w-0+deb11u1_amd64.deb     '.trim(), 'aadf8b4b197335645b230c2839b4517aa444fd2e8f434e5438c48a18857988f7' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/libssl1.1_1.1.1w-0+deb11u1_arm64.deb     '.trim(), 'fe7a7d313c87e46e62e614a07137e4a476a79fc9e5aab7b23e8235211280fee3' ],
  // update at 2022/05/23, to find from: https://packages.debian.org/search?keywords=libjemalloc2
  [ 'https://ftp.debian.org/debian/pool/main/j/jemalloc/libjemalloc2_5.2.1-3_amd64.deb          '.trim(), 'dcb79555b137ad70c9d392ca31e04533e3a10b63aa0db02d5a26f464060cc0f5' ],
  [ 'https://ftp.debian.org/debian/pool/main/j/jemalloc/libjemalloc2_5.2.1-3_arm64.deb          '.trim(), '7e3537d43b3109183bec24be8e1154a7643ad6e03bb851f2ae0b5dc065954c99' ]
]

const DEB12_FETCH_LIST = [
  // update at 2023/10/24, to find download start from: https://packages.debian.org/search?keywords=ca-certificates
  [ 'https://ftp.debian.org/debian/pool/main/c/ca-certificates/ca-certificates_20230311_all.deb '.trim(), '5308b9bd88eebe2a48be3168cb3d87677aaec5da9c63ad0cf561a29b8219115c' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/openssl_3.0.11-1~deb12u2_amd64.deb       '.trim(), 'ea063646d4f70d15be5ed52b67b5ac95d68dda823c60d808c7c25439c6d14e4d' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/openssl_3.0.11-1~deb12u2_arm64.deb       '.trim(), 'ef8ec413c2bd866dbe7ab068cd45b28d22e6c586e3ab0bd8de127a3e8dfe650b' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/libssl3_3.0.11-1~deb12u2_amd64.deb       '.trim(), '6e129c5814812b3516a656ae5b664b9970e2f8823250cd5b98190f21c0de2bca' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/libssl3_3.0.11-1~deb12u2_arm64.deb       '.trim(), '4e05dfa7319f72c5598f29a39eaf568203e2ae2314d5ef434dbf764de6448462' ],
  // update at 2023/02/28, to find from: https://packages.debian.org/search?keywords=libjemalloc2
  [ 'https://ftp.debian.org/debian/pool/main/j/jemalloc/libjemalloc2_5.3.0-1_amd64.deb          '.trim(), 'a4117c23c5c8acf6c9678a6cb086f000b79476369da7efe8a78a70826956ad3d' ],
  [ 'https://ftp.debian.org/debian/pool/main/j/jemalloc/libjemalloc2_5.3.0-1_arm64.deb          '.trim(), '866eba7688ec5cbb98200a05540c4909df6320557371b634b5d394cd32b9f252' ]
]

const RES_FLAVOR_NODE = [
  // update at 2023/10/24, to find download:
  // - https://deb.nodesource.com/node_20.x/dists/bullseye/main/binary-amd64/Packages // https://deb.nodesource.com/node_20.x/dists/bookworm/main/binary-amd64/Packages
  // - https://deb.nodesource.com/node_20.x/dists/bullseye/main/binary-arm64/Packages // https://deb.nodesource.com/node_20.x/dists/bookworm/main/binary-arm64/Packages
  [ 'https://deb.nodesource.com/node_20.x/pool/main/n/nodejs/nodejs_20.5.1-deb-1nodesource1_amd64.deb', '73458dd3d0d562f84e453a21801e9d2a5e08dd026f6409756371b92de6026828' ],
  [ 'https://deb.nodesource.com/node_20.x/pool/main/n/nodejs/nodejs_20.5.1-deb-1nodesource1_arm64.deb', '9e819cc7a63471c88da1fe5f5fe44987d54e0c810b16312bf0671db323b80556' ],
  // update at 2023/10/24, to find download from: `{ npm view npm@next-9; npm view @dr-js/core@latest; npm view @dr-js/dev@latest; } | grep -e tarball -e integrity`
  [ 'https://registry.npmjs.org/npm/-/npm-9.9.2.tgz           '.trim(), 'D3tV+W0PzJOlwo8YmO6fNzaB1CrMVYd1V+2TURF6lbCbmZKqMsYgeQfPVvqiM3zbNSJPhFEnmlEXIogH2Vq7PQ==:sha512:base64' ],
  [ 'https://registry.npmjs.org/@dr-js/core/-/core-0.5.13.tgz '.trim(), '2dUE+lNroFxDItKflu1/t9ebBMV6lEuMPyvPF6z7JJ4Ngjxg9n9dEmhb2aUl09ckZSbAKDyjbYWAi9Z42odvjg==:sha512:base64', 'dr-js-@@@.tgz' ], // NOTE: fix filename
  [ 'https://registry.npmjs.org/@dr-js/dev/-/dev-0.5.12.tgz   '.trim(), 'yr5I6JUjfCn6rVI9v5uN8QX5pFKWvItMKyKvgnch53AymrAC01dbUdhe8UNECbsmTqth2KZkwZ9tznJywz/GIw==:sha512:base64', 'dr-dev-@@@.tgz' ] // NOTE: fix filename
]
const RES_FLAVOR_BIN_NGINX = [
  // update at 2023/05/30, to find download from: https://nginx.org/en/download.html
  // and: https://github.com/google/ngx_brotli
  [ 'https://nginx.org/download/nginx-1.24.0.tar.gz             '.trim(), '77a2541637b92a621e3ee76776c8b7b40cf6d707e69ba53a940283e30ff2f55d' ], // TODO: need to calc hash yourself
  [ 'https://github.com/google/brotli/archive/ed738e84.zip      '.trim(), 'a68ec12a898abc9cf248f21362620562041b7aab4d623ecd736f39bedf5002a0', 'brotli.zip' ], // specify filename // TODO: need to calc hash yourself
  [ 'https://github.com/google/ngx_brotli/archive/a71f9312.zip  '.trim(), '96f23eb72488ffc570cbc474a928000b05b72f2682456ae357aeaf3ce71c626e', 'ngx-brotli.zip' ] // specify filename // TODO: need to calc hash yourself
]
const RES_FLAVOR_GO = [
  // update at 2023/10/24, to find download from: https://go.dev/dl/
  [ 'https://go.dev/dl/go1.21.5.linux-amd64.tar.gz', 'e2bc0b3e4b64111ec117295c088bde5f00eeed1567999ff77bc859d7df70078e' ],
  [ 'https://go.dev/dl/go1.21.5.linux-arm64.tar.gz', '841cced7ecda9b2014f139f5bab5ae31785f35399f236b8b3e75dff2a2978d96' ]
]
// update at 2023/05/30, to find download from: https://www.ruby-lang.org/en/downloads/releases/
// TODO: Ruby 2.7 reaches EOL
const TGZ_RUBY2 = [ 'https://cache.ruby-lang.org/pub/ruby/2.7/ruby-2.7.8.tar.gz', 'c2dab63cbc8f2a05526108ad419efa63a67ed4074dbbcf9fc2b1ca664cb45ba0' ]
// TODO: NOTE:
//   temp revert & wait for "Compatibility issues" fix since "3.2.0": https://www.ruby-lang.org/en/news/2022/12/25/ruby-3-2-0-released/
//   const TGZ_RUBY3 = [ 'https://cache.ruby-lang.org/pub/ruby/3.2/ruby-3.2.2.tar.gz', '96c57558871a6748de5bc9f274e93f4b5aad06cd8f37befa0e8d94e7b8a423bc' ]
const TGZ_RUBY3 = [ 'https://cache.ruby-lang.org/pub/ruby/3.1/ruby-3.1.4.tar.gz', 'a3d55879a0dfab1d7141fdf10d22a07dbf8e5cdc4415da1bde06127d5cc3c7b6' ]

// update at 2023/05/30, check version at: https://github.com/puppeteer/puppeteer/releases
// and version mapping from Chrome => Puppeteer: https://github.com/puppeteer/puppeteer/blob/main/versions.js
const PPTR_VERSION = '21.6.1' // ['119.0.6045.105', 'v21.5.0'] // https://github.com/puppeteer/puppeteer/blob/puppeteer-v21.6.1/versions.js
const DEB11_PPTR_VERSION_ARM64 = '21.6.1' // https://packages.debian.org/bullseye/chromium (120.0.6099.129-1~deb11u1)
const DEB12_PPTR_VERSION_ARM64 = '21.6.1' // https://packages.debian.org/bookworm/chromium (120.0.6099.129-1~deb12u1)

module.exports = {
  DEB11_FETCH_LIST,
  DEB12_FETCH_LIST,

  RES_FLAVOR_NODE,
  RES_FLAVOR_BIN_NGINX,
  RES_FLAVOR_GO,

  TGZ_RUBY2,
  TGZ_RUBY3,

  PPTR_VERSION,
  DEB11_PPTR_VERSION_ARM64,
  DEB12_PPTR_VERSION_ARM64
}
