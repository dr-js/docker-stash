const RES_CORE_DEB13 = [
  // update at 2026/03/02, start from: https://packages.debian.org/search?keywords=ca-certificates
  [ 'https://ftp.debian.org/debian/pool/main/c/ca-certificates/ca-certificates_20230311+deb12u1_all.deb', '0d5f444f594e48c1e16a41d8fc628a09b24c658916a1274025c2330f2a802bed' ],
  [ 'https://security.debian.org/debian-security/pool/updates/main/o/openssl/openssl_3.0.18-1~deb12u2_amd64.deb', '9107c374e0f760d5d7c9c7372788d4e618e1433db4fdef9a3a25788dfd5588bb' ],
  [ 'https://security.debian.org/debian-security/pool/updates/main/o/openssl/openssl_3.0.18-1~deb12u2_arm64.deb', 'ed4671eb9fcc282b69c9768863f2df0386664d686bb3103d5397802f9c0b1297' ],
  [ 'https://security.debian.org/debian-security/pool/updates/main/o/openssl/libssl3_3.0.18-1~deb12u2_amd64.deb', 'ed44f11b74763cded2ad406f4de4d585ea27b0ce6377e7c8d98c2ddf2ed35cb3' ],
  [ 'https://security.debian.org/debian-security/pool/updates/main/o/openssl/libssl3_3.0.18-1~deb12u2_arm64.deb', '30b2d6c27fd4a2f5ef554ac3b86c96e8a3abbbfb454c6dbe7e308ce9df36f8c5' ],
  // update at 2023/02/28, check: https://packages.debian.org/search?keywords=libjemalloc2
  [ 'https://ftp.debian.org/debian/pool/main/j/jemalloc/libjemalloc2_5.3.0-1_amd64.deb', 'a4117c23c5c8acf6c9678a6cb086f000b79476369da7efe8a78a70826956ad3d' ],
  [ 'https://ftp.debian.org/debian/pool/main/j/jemalloc/libjemalloc2_5.3.0-1_arm64.deb', '866eba7688ec5cbb98200a05540c4909df6320557371b634b5d394cd32b9f252' ]
]

const RES_NODE = [
  // update at 2026/03/02, check: https://nodejs.org/download/release/latest-v24.x/SHASUMS256.txt
  [ 'https://nodejs.org/download/release/latest-v24.x/node-v24.14.0-linux-x64.tar.gz  '.trim(), 'dbf5b8665dec15e59e6359a517fefb47b23fdb9152d8def975b9bca3dfc6d355', 'node-@@@-amd64.tar.gz' ], // NOTE: fix filename
  [ 'https://nodejs.org/download/release/latest-v24.x/node-v24.14.0-linux-arm64.tar.gz'.trim(), 'f44740cd218de8127f1c44c41510a3a740fa5c9c8d1cdce1c3bedada79f3cde7', 'node-@@@-arm64.tar.gz' ], // NOTE: fix filename
  // update at 2026/03/02, check: `{ npm view npm@next-11; npm view @dr-js/core@latest; npm view @dr-js/dev@latest; } | grep -e tarball -e integrity`
  [ 'https://registry.npmjs.org/npm/-/npm-11.11.0.tgz         '.trim(), '82gRxKrh/eY5UnNorkTFcdBQAGpgjWehkfGVqAGlJjejEtJZGGJUqjo3mbBTNbc5BTnPKGVtGPBZGhElujX5cw==:sha512:base64' ],
  [ 'https://registry.npmjs.org/@dr-js/core/-/core-0.5.17.tgz '.trim(), 'xHPK1TEXbvTKyH1UafKZFWqSqZZaYEtTLZ6hVEvYasmm3sFSUPA0rbw/r1DPGRJ7QlLkdzCewS4t11C1B9l0DA==:sha512:base64', 'dr-js-@@@.tgz' ], // NOTE: fix filename
  [ 'https://registry.npmjs.org/@dr-js/dev/-/dev-0.5.14.tgz   '.trim(), 'KWwHsqxHrOtuVNPTq2chms7bXsQnti05UXp7dQIWUGVqOC+nQs6uN1KlIRqwJXZ5eo2pZnNCjk+GQ3RcpEyfjg==:sha512:base64', 'dr-dev-@@@.tgz' ] // NOTE: fix filename
]
const RES_NGINX = [
  // update at 2026/03/02, use Stable version, check: https://nginx.org/en/download.html
  // and: https://github.com/google/ngx_brotli
  [ 'https://nginx.org/download/nginx-1.28.2.tar.gz             '.trim(), '20e5e0f2c917acfb51120eec2fba9a4ba4e1e10fd28465067cc87a7d81a829a3' ], // TODO: need to calc hash yourself
  [ 'https://github.com/google/brotli/archive/ed738e84.zip      '.trim(), 'a68ec12a898abc9cf248f21362620562041b7aab4d623ecd736f39bedf5002a0', 'brotli.zip' ], // specify filename // TODO: need to calc hash yourself
  [ 'https://github.com/google/ngx_brotli/archive/a71f9312.zip  '.trim(), '96f23eb72488ffc570cbc474a928000b05b72f2682456ae357aeaf3ce71c626e', 'ngx-brotli.zip' ] // specify filename // TODO: need to calc hash yourself
]
const RES_GO = [
  // update at 2026/03/02, use 2nd-recent-minor version, check: https://go.dev/dl/
  [ 'https://go.dev/dl/go1.25.7.linux-amd64.tar.gz', '12e6d6a191091ae27dc31f6efc630e3a3b8ba409baf3573d955b196fdf086005' ],
  [ 'https://go.dev/dl/go1.25.7.linux-arm64.tar.gz', 'ba611a53534135a81067240eff9508cd7e256c560edd5d8c2fef54f083c07129' ]
]
// update at 2025/06/03, check: ".github/check-layer-package-latest.js"
const RES_F_BIT_DEB13 = [
  [ 'https://packages.fluentbit.io/debian/trixie/pool/main/f/fluent-bit/fluent-bit_3.2.10_amd64.deb', 'e9959ebce2e1aede5033caf686951d9b91d0d01833808290d9db6bbe79defc02' ],
  [ 'https://packages.fluentbit.io/debian/trixie/pool/main/f/fluent-bit/fluent-bit_3.2.10_arm64.deb', 'dd70e11002f035e53a13d7d8475b64270068ff106b402ea7cecaf3a8f5529b8a' ]
]
// update at 2025/12/19, from: https://www.ruby-lang.org/en/downloads/releases/
const RES_RUBY3 = [ [ 'https://cache.ruby-lang.org/pub/ruby/3.4/ruby-3.4.8.tar.gz', '53c4ddad41fbb6189f1f5ee0db57a51d54bd1f87f8755b3d68604156a35b045b' ] ]

// update at 2026/03/02, for `puppeteer-core`, version need match `RES_BROWSER`
const PPTR_VER = '24.37.5'
// update at 2026/03/02, check version mapping at: https://github.com/puppeteer/puppeteer/blob/main/versions.json
const RES_BROWSER = [ // [ "v24.37.5", { "chrome": "145.0.7632.77", "firefox": "stable_147.0.4" } ]
  [ 'https://security.debian.org/debian-security/pool/updates/main/c/chromium/chromium_145.0.7632.116-1~deb12u1_amd64.deb', 'cc30231002bc060a1854e2444040abc89264bbb2f1be162f016af8e246202e26' ],
  [ 'https://security.debian.org/debian-security/pool/updates/main/c/chromium/chromium_145.0.7632.116-1~deb12u1_arm64.deb', '61bdba6fed164117e5da0cd05027b59e4b87387336c4207d1fae78800539208e' ],
  [ 'https://security.debian.org/debian-security/pool/updates/main/c/chromium/chromium-common_145.0.7632.116-1~deb12u1_amd64.deb', '9ccf8c99f3701028ca95d1d7b161f71f9912a56c25d1cef30f3c58ac6e1b4167' ],
  [ 'https://security.debian.org/debian-security/pool/updates/main/c/chromium/chromium-common_145.0.7632.116-1~deb12u1_arm64.deb', 'aad106ff9dc83b204e0c10e742869274f797c7402d49039bfac0bbf2f7cb381e' ],
  [ 'https://packages.mozilla.org/apt/pool/mozilla/firefox_148.0~build1_amd64_2ed57f9938e0e3b6210a7fb3d7904e73.deb', 'c714ae7c4248f16087b29645bc8f0b9a73aa4e70aa7fb3c2632703f2a311fd83' ],
  [ 'https://packages.mozilla.org/apt/pool/mozilla/firefox_148.0~build1_arm64_59718f33bff5c8c5ddf4d5bb140d4c13.deb', '104755fd66eda9c7cf8368d294c9488f0591283cfe61ecbeb5093905862a1d37' ]
]

module.exports = {
  RES_CORE_DEB13,

  RES_NODE,
  RES_NGINX,
  RES_GO,
  RES_F_BIT_DEB13,

  RES_RUBY3,

  PPTR_VER, RES_BROWSER
}
