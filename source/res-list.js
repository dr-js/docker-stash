const RES_CORE_DEB12 = [
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

const RES_NODE = [
  // update at 2024/06/26, to find download, check: ".github/check-layer-package-latest.js"
  [ 'https://deb.nodesource.com/node_20.x/pool/main/n/nodejs/nodejs_20.15.0-1nodesource1_amd64.deb', '9fd6bc3754cfc5960ce9c08640dbefa4093c274cff4f15065f754849f275c5b8' ],
  [ 'https://deb.nodesource.com/node_20.x/pool/main/n/nodejs/nodejs_20.15.0-1nodesource1_arm64.deb', '1e84bd7eb0d0a2c323590d7690d97a14f28162867db18404e73631b59cac934b' ],
  // update at 2024/06/25, to find download from: `{ npm view npm@next-9; npm view @dr-js/core@latest; npm view @dr-js/dev@latest; } | grep -e tarball -e integrity`
  [ 'https://registry.npmjs.org/npm/-/npm-9.9.3.tgz           '.trim(), 'Z1l+rcQ5kYb17F3hHtO601arEpvdRYnCLtg8xo3AGtyj3IthwaraEOexI9903uANkifFbqHC8hT53KIrozWg8A==:sha512:base64' ],
  [ 'https://registry.npmjs.org/@dr-js/core/-/core-0.5.15.tgz '.trim(), 'dDIB/zXAxXVlpjLIYF+bYfLI7pwVvGQLQRjdh5MDfXgDJ3wgcbbh38h5Ic95Mai0Yf9CNu/gccihqgqxGOt3HQ==:sha512:base64', 'dr-js-@@@.tgz' ], // NOTE: fix filename
  [ 'https://registry.npmjs.org/@dr-js/dev/-/dev-0.5.14.tgz   '.trim(), 'KWwHsqxHrOtuVNPTq2chms7bXsQnti05UXp7dQIWUGVqOC+nQs6uN1KlIRqwJXZ5eo2pZnNCjk+GQ3RcpEyfjg==:sha512:base64', 'dr-dev-@@@.tgz' ] // NOTE: fix filename
]
const RES_NGINX = [
  // update at 2024/06/25, to find download from: https://nginx.org/en/download.html
  // and: https://github.com/google/ngx_brotli
  [ 'https://nginx.org/download/nginx-1.26.1.tar.gz             '.trim(), 'f9187468ff2eb159260bfd53867c25ff8e334726237acf227b9e870e53d3e36b' ], // TODO: need to calc hash yourself
  [ 'https://github.com/google/brotli/archive/ed738e84.zip      '.trim(), 'a68ec12a898abc9cf248f21362620562041b7aab4d623ecd736f39bedf5002a0', 'brotli.zip' ], // specify filename // TODO: need to calc hash yourself
  [ 'https://github.com/google/ngx_brotli/archive/a71f9312.zip  '.trim(), '96f23eb72488ffc570cbc474a928000b05b72f2682456ae357aeaf3ce71c626e', 'ngx-brotli.zip' ] // specify filename // TODO: need to calc hash yourself
]
const RES_GO = [
  // update at 2024/06/25, to find download from: https://go.dev/dl/
  [ 'https://go.dev/dl/go1.22.4.linux-amd64.tar.gz', 'ba79d4526102575196273416239cca418a651e049c2b099f3159db85e7bade7d' ],
  [ 'https://go.dev/dl/go1.22.4.linux-arm64.tar.gz', 'a8e177c354d2e4a1b61020aca3562e27ea3e8f8247eca3170e3fa1e0c2f9e771' ]
]
// update at 2023/10/24, to find download, check: ".github/check-layer-package-latest.js"
const RES_F_BIT_DEB12 = [
  [ 'https://packages.fluentbit.io/debian/bookworm/pool/main/f/fluent-bit/fluent-bit_3.0.7_amd64.deb', '7284302d281e8b91fe17e00552fa8d794d0cc05ebaf976171e5e57316893be66' ],
  [ 'https://packages.fluentbit.io/debian/bookworm/pool/main/f/fluent-bit/fluent-bit_3.0.7_arm64.deb', 'f1b29677c323be63a61cfb4b71a583ecbeeaab0f13942616aed7b61ba475b2f3' ]
]
// update at 2024/06/25, to find download from: https://www.ruby-lang.org/en/downloads/releases/
// TODO: Ruby 2.7 reaches EOL
const RES_RUBY2 = [
  [ 'https://cache.ruby-lang.org/pub/ruby/2.7/ruby-2.7.8.tar.gz', 'c2dab63cbc8f2a05526108ad419efa63a67ed4074dbbcf9fc2b1ca664cb45ba0' ],
  // for manual build openssl1.1 on Deb12, check: https://github.com/rbenv/ruby-build/discussions/1940#discussioncomment-3724881
  // update at 2024/06/25, to find download, check: https://github.com/rbenv/ruby-build/blob/v20240612/share/ruby-build/2.7.8
  [ 'https://www.openssl.org/source/openssl-1.1.1w.tar.gz', 'cf3098950cb4d853ad95c0841f1f9c6d3dc102dccfcacd521d93925208b76ac8' ]
]
// TODO: NOTE:
//   temp revert & wait for "Compatibility issues" fix since "3.3.0": https://www.ruby-lang.org/en/news/2023/12/25/ruby-3-3-0-released/
//   temp revert & wait for "Compatibility issues" fix since "3.2.0": https://www.ruby-lang.org/en/news/2022/12/25/ruby-3-2-0-released/
//   const RES_RUBY3 = [ [ 'https://cache.ruby-lang.org/pub/ruby/3.3/ruby-3.3.3.tar.gz', '83c05b2177ee9c335b631b29b8c077b4770166d02fa527f3a9f6a40d13f3cce2' ] ]
const RES_RUBY3 = [ [ 'https://cache.ruby-lang.org/pub/ruby/3.1/ruby-3.1.6.tar.gz', '0d0dafb859e76763432571a3109d1537d976266be3083445651dc68deed25c22' ] ]

// update at 2024/06/27, check version at: https://github.com/puppeteer/puppeteer/releases/latest
// and version mapping from Chrome => Puppeteer: https://github.com/puppeteer/puppeteer/blob/main/versions.js
const PPTR_VER = '22.12.1' // ['126.0.6478.126', 'v22.12.1']
const PPTR_VER_ARM64_DEB12 = '22.12.1' // ['126.0.6478.126', 'v22.12.1'] // https://packages.debian.org/bookworm/chromium (126.0.6478.126-1~deb12u1)

module.exports = {
  RES_CORE_DEB12,

  RES_NODE,
  RES_NGINX,
  RES_GO,
  RES_F_BIT_DEB12,

  RES_RUBY2,
  RES_RUBY3,

  PPTR_VER, PPTR_VER_ARM64_DEB12
}
