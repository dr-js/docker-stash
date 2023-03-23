const DEB11_FETCH_LIST = [
  // update at 2022/07/28, to find download start from: https://packages.debian.org/search?keywords=ca-certificates
  [ 'https://ftp.debian.org/debian/pool/main/c/ca-certificates/ca-certificates_20210119_all.deb', 'b2d488ad4d8d8adb3ba319fc9cb2cf9909fc42cb82ad239a26c570a2e749c389' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/openssl_1.1.1n-0+deb11u3_amd64.deb', '3691cf432febeb8dd621c6a36e3cc66b45fc119016532ffb33c742861aec868b' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/openssl_1.1.1n-0+deb11u3_arm64.deb', 'ff9a7649fa24c5d1fa5ddcbd4c4e9fd5facb205ddc7b796f61de1107dabb00fd' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/libssl1.1_1.1.1n-0+deb11u3_amd64.deb', 'c3480bf90725c993187de02e5144e90ea81226e7e2538ba24687f5a0adc8ca5c' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/libssl1.1_1.1.1n-0+deb11u3_arm64.deb', '8d4ef5a06719fabd90a6a27729ade7b9dde1a1c923a89ba1406af6489fa7c82f' ],
  // update at 2022/05/23, to find from: https://packages.debian.org/search?keywords=libjemalloc2
  [ 'https://ftp.debian.org/debian/pool/main/j/jemalloc/libjemalloc2_5.2.1-3_amd64.deb', 'dcb79555b137ad70c9d392ca31e04533e3a10b63aa0db02d5a26f464060cc0f5' ],
  [ 'https://ftp.debian.org/debian/pool/main/j/jemalloc/libjemalloc2_5.2.1-3_arm64.deb', '7e3537d43b3109183bec24be8e1154a7643ad6e03bb851f2ae0b5dc065954c99' ]
]

const DEB12_FETCH_LIST = [
  // update at 2023/02/28, to find download start from: https://packages.debian.org/search?keywords=ca-certificates
  [ 'https://ftp.debian.org/debian/pool/main/c/ca-certificates/ca-certificates_20211016_all.deb', 'd7abcfaa67bc16c4aed960c959ca62849102c8a0a61b9af9a23fcc870ebc3c57' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/openssl_3.0.8-1_amd64.deb', 'a3b6e179fe997a60f3ba2a01b1fac5fe60ffcccccd290cfc16607736701825c1' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/openssl_3.0.8-1_arm64.deb', '9fa3ae14420e8a214eb5916648529de9abecd6f172925f9c9fa0b0cece8f95ce' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/libssl3_3.0.8-1_amd64.deb', '9335d0762564401f6cb3f1ddd7f8d9de4a10c93975b77ddf82f048002f17798d' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/libssl3_3.0.8-1_arm64.deb', 'e488773b4434bfcd6807370abcae9d7280b981bec4c9f02c5c23ad16c13322dd' ],
  // update at 2023/02/28, to find from: https://packages.debian.org/search?keywords=libjemalloc2
  [ 'https://ftp.debian.org/debian/pool/main/j/jemalloc/libjemalloc2_5.3.0-1_amd64.deb', 'a4117c23c5c8acf6c9678a6cb086f000b79476369da7efe8a78a70826956ad3d' ],
  [ 'https://ftp.debian.org/debian/pool/main/j/jemalloc/libjemalloc2_5.3.0-1_arm64.deb', '866eba7688ec5cbb98200a05540c4909df6320557371b634b5d394cd32b9f252' ]
]

const RES_FLAVOR_NODE = [
  // update at 2023/03/13, to find download:
  // - https://deb.nodesource.com/node_18.x/dists/bullseye/main/binary-amd64/Packages // https://deb.nodesource.com/node_18.x/dists/bookworm/main/binary-amd64/Packages
  // - https://deb.nodesource.com/node_18.x/dists/bullseye/main/binary-arm64/Packages // https://deb.nodesource.com/node_18.x/dists/bookworm/main/binary-arm64/Packages
  [ 'https://deb.nodesource.com/node_18.x/pool/main/n/nodejs/nodejs_18.15.0-deb-1nodesource1_amd64.deb', 'c253e9021faf026115d45ae8ea56f5c587483baebeab1394578c3cd1d44d9c64' ],
  [ 'https://deb.nodesource.com/node_18.x/pool/main/n/nodejs/nodejs_18.15.0-deb-1nodesource1_arm64.deb', '3d65172723241314da098e976a37801ebd179caa10806147b257e201c66db86b' ],
  // update at 2023/03/07, to find download from: `npm view npm@8; npm view @dr-js/core@latest; npm view @dr-js/dev@latest`
  [ 'https://registry.npmjs.org/npm/-/npm-8.19.4.tgz', '3HANl8i9DKnUA89P4KEgVNN28EjSeDCmvEqbzOAuxCFDzdBZzjUl99zgnGpOUumvW5lvJo2HKcjrsc+tfyv1Hw==:sha512:base64' ],
  [ 'https://registry.npmjs.org/@dr-js/core/-/core-0.5.8.tgz', 'KlVEDEEXtgAjAt2u82TComdIGSRfbMBcyt59zxw0/rjCaw3w270u3OEHWvhCz+SO4rFCjy6rZxA1+UopbCIzFg==:sha512:base64', 'dr-js-@@@.tgz' ], // NOTE: fix filename
  [ 'https://registry.npmjs.org/@dr-js/dev/-/dev-0.5.7.tgz', 'E/14zhfU4201BB7JtZI2FlKJDD0AkTc9TliKgfIuSbIg+kKeBcgQvtYUGFaOP381pZP9v83fsjT1P0prP3McBw==:sha512:base64', 'dr-dev-@@@.tgz' ] // NOTE: fix filename
]
const RES_FLAVOR_BIN_NGINX = [
  // update at 2022/11/23, to find download from: https://nginx.org/en/download.html
  // and: https://github.com/google/ngx_brotli
  [ 'https://nginx.org/download/nginx-1.22.1.tar.gz', '9ebb333a9e82b952acd3e2b4aeb1d4ff6406f72491bab6cd9fe69f0dea737f31' ], // TODO: need to calc hash yourself
  [ 'https://github.com/google/brotli/archive/f4153a09.zip', '126fdd3252db2428bf6ced066dd73298dc151d46a0f17f3d050eebe7cd3032ca', 'brotli.zip' ], // specify filename // TODO: need to calc hash yourself
  [ 'https://github.com/google/ngx_brotli/archive/6e975bcb.zip', '62914aceb8cb8c87d09e2879e6de3627d50a7d1bd6a4b1460cb393a3891b684d', 'ngx-brotli.zip' ] // specify filename // TODO: need to calc hash yourself
]
const RES_FLAVOR_GO = [
  // update at 2023/03/13, to find download from: https://go.dev/dl/
  [ 'https://go.dev/dl/go1.20.2.linux-amd64.tar.gz', '4eaea32f59cde4dc635fbc42161031d13e1c780b87097f4b4234cfce671f1768' ],
  [ 'https://go.dev/dl/go1.20.2.linux-arm64.tar.gz', '78d632915bb75e9a6356a47a42625fd1a785c83a64a643fedd8f61e31b1b3bef' ]
]
// update at 2023/03/13, to find download from: https://www.ruby-lang.org/en/downloads/releases/
const TGZ_RUBY = [ 'https://cache.ruby-lang.org/pub/ruby/2.7/ruby-2.7.7.tar.gz', 'e10127db691d7ff36402cfe88f418c8d025a3f1eea92044b162dd72f0b8c7b90' ]
// TODO: NOTE:
//   temp revert & wait for "Compatibility issues" fix since "3.2.0": https://www.ruby-lang.org/en/news/2022/12/25/ruby-3-2-0-released/
//   const TGZ_RUBY3 = [ 'https://cache.ruby-lang.org/pub/ruby/3.2/ruby-3.2.1.tar.gz', '13d67901660ee3217dbd9dd56059346bd4212ce64a69c306ef52df64935f8dbd' ]
const TGZ_RUBY3 = [ 'https://cache.ruby-lang.org/pub/ruby/3.1/ruby-3.1.3.tar.gz', '5ea498a35f4cd15875200a52dde42b6eb179e1264e17d78732c3a57cd1c6ab9e' ]

// update at 2023/03/13, check version at: https://github.com/puppeteer/puppeteer/releases
const PPTR_VERSION = '19.7.4'
// [up-to 19.3.0] 19.2.0 (2022-10-26) chromium: roll to Chromium 108.0.5351.0 (r1056772)
const DEB11_PPTR_VERSION_ARM64 = '19.3.0' // https://packages.debian.org/bullseye/chromium (108.0.5359.94-1~deb11u1)
// [up-to 19.7.4] 19.7.0 (2023-02-13) chromium: roll to Chromium 111.0.5556.0 (r1095492)
const DEB12_PPTR_VERSION_ARM64 = '19.7.4' // https://packages.debian.org/bookworm/chromium chromium (111.0.5563.64-1)

// update at 2023/03/13, check version at: https://rubygems.org/pages/download
const GEM_VERSION = '3.4.8'
// update at 2023/03/23, check version at: https://rubygems.org/gems/bundler
const BUNDLER_VERSION = '2.4.9'

module.exports = {
  DEB11_FETCH_LIST,
  DEB12_FETCH_LIST,

  RES_FLAVOR_NODE,
  RES_FLAVOR_BIN_NGINX,
  RES_FLAVOR_GO,

  TGZ_RUBY,
  TGZ_RUBY3,

  PPTR_VERSION,
  DEB11_PPTR_VERSION_ARM64,
  DEB12_PPTR_VERSION_ARM64,

  GEM_VERSION,
  BUNDLER_VERSION
}
