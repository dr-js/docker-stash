const DEB11_FETCH_LIST = [
  // update at 2022/05/30, to find download start from: https://packages.debian.org/search?keywords=ca-certificates
  [ 'https://ftp.debian.org/debian/pool/main/c/ca-certificates/ca-certificates_20210119_all.deb', 'b2d488ad4d8d8adb3ba319fc9cb2cf9909fc42cb82ad239a26c570a2e749c389' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/openssl_1.1.1n-0+deb11u4_amd64.deb', '0354f1f234a2528885bb3fff9785050d9b01d4c41445afc101790162ae043ef2' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/openssl_1.1.1n-0+deb11u4_arm64.deb', 'fcb50f2a9cdd98ff4684b5b797e3c8b9642b8bfe906a4d8d67629d2b0ea19fce' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/libssl1.1_1.1.1n-0+deb11u4_amd64.deb', '62faed6afef01c09524a5f082bd63f1732c5f986856be11a3e7401128c5c01c9' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/libssl1.1_1.1.1n-0+deb11u4_arm64.deb', '0f7cd746ec47fd22e40df22d7033625e6057c1a7831866f421194824e17f93ce' ],
  // update at 2022/05/23, to find from: https://packages.debian.org/search?keywords=libjemalloc2
  [ 'https://ftp.debian.org/debian/pool/main/j/jemalloc/libjemalloc2_5.2.1-3_amd64.deb', 'dcb79555b137ad70c9d392ca31e04533e3a10b63aa0db02d5a26f464060cc0f5' ],
  [ 'https://ftp.debian.org/debian/pool/main/j/jemalloc/libjemalloc2_5.2.1-3_arm64.deb', '7e3537d43b3109183bec24be8e1154a7643ad6e03bb851f2ae0b5dc065954c99' ]
]

const DEB12_FETCH_LIST = [
  // update at 2023/03/23, to find download start from: https://packages.debian.org/search?keywords=ca-certificates
  [ 'https://ftp.debian.org/debian/pool/main/c/ca-certificates/ca-certificates_20230311_all.deb', '5308b9bd88eebe2a48be3168cb3d87677aaec5da9c63ad0cf561a29b8219115c' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/openssl_3.0.8-1_amd64.deb', 'a3b6e179fe997a60f3ba2a01b1fac5fe60ffcccccd290cfc16607736701825c1' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/openssl_3.0.8-1_arm64.deb', '9fa3ae14420e8a214eb5916648529de9abecd6f172925f9c9fa0b0cece8f95ce' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/libssl3_3.0.8-1_amd64.deb', '9335d0762564401f6cb3f1ddd7f8d9de4a10c93975b77ddf82f048002f17798d' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/libssl3_3.0.8-1_arm64.deb', 'e488773b4434bfcd6807370abcae9d7280b981bec4c9f02c5c23ad16c13322dd' ],
  // update at 2023/02/28, to find from: https://packages.debian.org/search?keywords=libjemalloc2
  [ 'https://ftp.debian.org/debian/pool/main/j/jemalloc/libjemalloc2_5.3.0-1_amd64.deb', 'a4117c23c5c8acf6c9678a6cb086f000b79476369da7efe8a78a70826956ad3d' ],
  [ 'https://ftp.debian.org/debian/pool/main/j/jemalloc/libjemalloc2_5.3.0-1_arm64.deb', '866eba7688ec5cbb98200a05540c4909df6320557371b634b5d394cd32b9f252' ]
]

const RES_FLAVOR_NODE = [
  // update at 2022/05/30, to find download:
  // - https://deb.nodesource.com/node_18.x/dists/bullseye/main/binary-amd64/Packages // https://deb.nodesource.com/node_18.x/dists/bookworm/main/binary-amd64/Packages
  // - https://deb.nodesource.com/node_18.x/dists/bullseye/main/binary-arm64/Packages // https://deb.nodesource.com/node_18.x/dists/bookworm/main/binary-arm64/Packages
  [ 'https://deb.nodesource.com/node_20.x/pool/main/n/nodejs/nodejs_20.2.0-deb-1nodesource1_amd64.deb', 'af838d90c79db512d1fb957b41f4e7ff2921b9597d506118f211b6449987727b' ],
  [ 'https://deb.nodesource.com/node_20.x/pool/main/n/nodejs/nodejs_20.2.0-deb-1nodesource1_arm64.deb', '7c729b0562d993ccc21ad7e8984fefa4d15d0386071f0f2a9e4232628a706c23' ],
  // update at 2022/05/30, to find download from: `npm view npm@latest; npm view @dr-js/core@latest; npm view @dr-js/dev@latest`
  [ 'https://registry.npmjs.org/npm/-/npm-9.6.7.tgz', 'xwkU1hSZl6Qrkfw3fhxVmMfNWu0A67+aZZs5gz/LoehCeAPkVhQDB90Z2NFoPSI1KpfBWCJ6Bp28wXzv5U5/2g==:sha512:base64' ],
  [ 'https://registry.npmjs.org/@dr-js/core/-/core-0.5.11.tgz', 'xTiyj4P/5/qpz12es+SESHPkHAm8w5tnRp7TCKr9UWt6Wq291F1jproYnZFIntPmwIbcVgl+MYQ1G1wclBAWzQ==:sha512:base64', 'dr-js-@@@.tgz' ], // NOTE: fix filename
  [ 'https://registry.npmjs.org/@dr-js/dev/-/dev-0.5.9.tgz', 't+443847DkWqoplU1mH10V5CR0iEt9avqiW+/p794Ap0NNdbabe0c6fWlCRv2JjEOlk25OTgALeddIvOYF5Q/g==:sha512:base64', 'dr-dev-@@@.tgz' ] // NOTE: fix filename
]
const RES_FLAVOR_BIN_NGINX = [
  // update at 2022/05/30, to find download from: https://nginx.org/en/download.html
  // and: https://github.com/google/ngx_brotli
  [ 'https://nginx.org/download/nginx-1.24.0.tar.gz', '77a2541637b92a621e3ee76776c8b7b40cf6d707e69ba53a940283e30ff2f55d' ], // TODO: need to calc hash yourself
  [ 'https://github.com/google/brotli/archive/f4153a09.zip', '126fdd3252db2428bf6ced066dd73298dc151d46a0f17f3d050eebe7cd3032ca', 'brotli.zip' ], // specify filename // TODO: need to calc hash yourself
  [ 'https://github.com/google/ngx_brotli/archive/6e975bcb.zip', '62914aceb8cb8c87d09e2879e6de3627d50a7d1bd6a4b1460cb393a3891b684d', 'ngx-brotli.zip' ] // specify filename // TODO: need to calc hash yourself
]
const RES_FLAVOR_GO = [
  // update at 2022/05/30, to find download from: https://go.dev/dl/
  [ 'https://go.dev/dl/go1.20.4.linux-amd64.tar.gz', '698ef3243972a51ddb4028e4a1ac63dc6d60821bf18e59a807e051fee0a385bd' ],
  [ 'https://go.dev/dl/go1.20.4.linux-arm64.tar.gz', '105889992ee4b1d40c7c108555222ca70ae43fccb42e20fbf1eebb822f5e72c6' ]
]
// update at 2022/05/30, to find download from: https://www.ruby-lang.org/en/downloads/releases/
// TODO: Ruby 2.7 reaches EOL
const TGZ_RUBY = [ 'https://cache.ruby-lang.org/pub/ruby/2.7/ruby-2.7.8.tar.gz', 'c2dab63cbc8f2a05526108ad419efa63a67ed4074dbbcf9fc2b1ca664cb45ba0' ]
// TODO: NOTE:
//   temp revert & wait for "Compatibility issues" fix since "3.2.0": https://www.ruby-lang.org/en/news/2022/12/25/ruby-3-2-0-released/
//   const TGZ_RUBY3 = [ 'https://cache.ruby-lang.org/pub/ruby/3.2/ruby-3.2.2.tar.gz', '96c57558871a6748de5bc9f274e93f4b5aad06cd8f37befa0e8d94e7b8a423bc' ]
const TGZ_RUBY3 = [ 'https://cache.ruby-lang.org/pub/ruby/3.1/ruby-3.1.4.tar.gz', 'a3d55879a0dfab1d7141fdf10d22a07dbf8e5cdc4415da1bde06127d5cc3c7b6' ]

// update at 2022/05/30, check version at: https://github.com/puppeteer/puppeteer/releases
// and version mapping from Chrome => Puppeteer: https://github.com/puppeteer/puppeteer/blob/main/versions.js
const PPTR_VERSION = '19.11.1' // ['112.0.5614.0', 'v19.8.0'] // https://github.com/puppeteer/puppeteer/blob/puppeteer-v19.11.1/versions.js
const DEB11_PPTR_VERSION_ARM64 = '19.11.1' // https://packages.debian.org/bullseye/chromium (112.0.5615.138-1~deb11u1)
const DEB12_PPTR_VERSION_ARM64 = '19.11.1' // https://packages.debian.org/bookworm/chromium (113.0.5672.126-1)

// update at 2022/05/30, check version at: https://rubygems.org/pages/download
const GEM_VERSION = '3.4.13'
// update at 2022/05/30, check version at: https://rubygems.org/gems/bundler
const BUNDLER_VERSION = '2.4.13'

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
