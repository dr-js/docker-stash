const RES_CORE_DEB12 = [
  // update at 2024/08/05, to find download start from: https://packages.debian.org/search?keywords=ca-certificates
  [ 'https://ftp.debian.org/debian/pool/main/c/ca-certificates/ca-certificates_20230311_all.deb '.trim(), '5308b9bd88eebe2a48be3168cb3d87677aaec5da9c63ad0cf561a29b8219115c' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/openssl_3.0.13-1~deb12u1_amd64.deb       '.trim(), '262faebdc38b64e9e0553388e8608b0b6ae1b56871e7a8b09737ab0f2df11f8c' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/openssl_3.0.13-1~deb12u1_arm64.deb       '.trim(), 'fe4726cd05854fd6db1efe869e158b34b23789d0742144d2313e060331001dc3' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/libssl3_3.0.13-1~deb12u1_amd64.deb       '.trim(), '8e88b98b3fc634721d0899f498d4cf2e62405faaab6582123c7923b1ec8129e1' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/libssl3_3.0.13-1~deb12u1_arm64.deb       '.trim(), 'aeffbc4770e2da3a356eb3c8369e79f89623ffc4bc14eb18d6ff29d9bdcb1fba' ],
  // update at 2023/02/28, to find from: https://packages.debian.org/search?keywords=libjemalloc2
  [ 'https://ftp.debian.org/debian/pool/main/j/jemalloc/libjemalloc2_5.3.0-1_amd64.deb          '.trim(), 'a4117c23c5c8acf6c9678a6cb086f000b79476369da7efe8a78a70826956ad3d' ],
  [ 'https://ftp.debian.org/debian/pool/main/j/jemalloc/libjemalloc2_5.3.0-1_arm64.deb          '.trim(), '866eba7688ec5cbb98200a05540c4909df6320557371b634b5d394cd32b9f252' ]
]

const RES_NODE = [
  // update at 2024/08/05, to find download, check: ".github/check-layer-package-latest.js"
  [ 'https://deb.nodesource.com/node_20.x/pool/main/n/nodejs/nodejs_20.16.0-1nodesource1_amd64.deb', 'a78c0997f37bf41e7b8e999ecec49da0a2d46b7db874e6f74932e75e1b9616ed' ],
  [ 'https://deb.nodesource.com/node_20.x/pool/main/n/nodejs/nodejs_20.16.0-1nodesource1_arm64.deb', '42c7625ea2749c1108c701b6b06197d756a9683b5a1f1645fbdf52c586fb21a4' ],
  // update at 2024/08/05, to find download from: `{ npm view npm@next-10; npm view @dr-js/core@latest; npm view @dr-js/dev@latest; } | grep -e tarball -e integrity`
  [ 'https://registry.npmjs.org/npm/-/npm-10.8.2.tgz          '.trim(), 'x/AIjFIKRllrhcb48dqUNAAZl0ig9+qMuN91RpZo3Cb2+zuibfh+KISl6+kVVyktDz230JKc208UkQwwMqyB+w==:sha512:base64' ],
  [ 'https://registry.npmjs.org/@dr-js/core/-/core-0.5.17.tgz '.trim(), 'xHPK1TEXbvTKyH1UafKZFWqSqZZaYEtTLZ6hVEvYasmm3sFSUPA0rbw/r1DPGRJ7QlLkdzCewS4t11C1B9l0DA==:sha512:base64', 'dr-js-@@@.tgz' ], // NOTE: fix filename
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
  // update at 2024/08/05, to find download from: https://go.dev/dl/
  [ 'https://go.dev/dl/go1.22.5.linux-amd64.tar.gz', '904b924d435eaea086515bc63235b192ea441bd8c9b198c507e85009e6e4c7f0' ],
  [ 'https://go.dev/dl/go1.22.5.linux-arm64.tar.gz', '8d21325bfcf431be3660527c1a39d3d9ad71535fabdf5041c826e44e31642b5a' ]
]
// update at 2024/08/05, to find download, check: ".github/check-layer-package-latest.js"
const RES_F_BIT_DEB12 = [
  [ 'https://packages.fluentbit.io/debian/bookworm/pool/main/f/fluent-bit/fluent-bit_3.1.4_amd64.deb', '4bc8dc02645cb1203f3189e19feada36cd69335839d69a56067bafd5f1fafe9f' ],
  [ 'https://packages.fluentbit.io/debian/bookworm/pool/main/f/fluent-bit/fluent-bit_3.1.4_arm64.deb', 'de482e008e9b21fb4a55321435d6287a44ff04abc8f89ce9b91480ce803573a8' ]
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

// update at 2024/08/05, check version at: https://github.com/puppeteer/puppeteer/releases/latest
// and version mapping from Chrome => Puppeteer: https://github.com/puppeteer/puppeteer/blob/main/versions.json
const PPTR_VER = '22.15.0' // ['127.0.6533.88', 'v22.15.0']
const PPTR_VER_ARM64_DEB12 = '22.13.1' // ['126.0.6478.182', 'v22.13.1'] // https://packages.debian.org/bookworm/chromium (127.0.6533.88-1~deb12u1_amd64/126.0.6478.182-1~deb12u1_arm64)

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
