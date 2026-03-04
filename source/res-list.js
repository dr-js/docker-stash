const RES_CORE_DEB13 = [
  // update at 2026/03/04, start from: https://packages.debian.org/search?keywords=ca-certificates
  [ 'https://ftp.debian.org/debian/pool/main/c/ca-certificates/ca-certificates_20250419_all.deb', 'ef590f89563aa4b46c8260d49d1cea0fc1b181d19e8df3782694706adf05c184' ],
  [ 'https://security.debian.org/debian-security/pool/updates/main/o/openssl/openssl_3.5.4-1~deb13u2_amd64.deb', '583f2881a9ed89e480d46caa3de39a6f0e174d259077a98c8b6cc3d46166e1e5' ],
  [ 'https://security.debian.org/debian-security/pool/updates/main/o/openssl/openssl_3.5.4-1~deb13u2_arm64.deb', 'b51177af3e5b9ff495c82ecd6f6df596c4272600dbbea328f8ac9210598f154b' ],
  [ 'https://security.debian.org/debian-security/pool/updates/main/o/openssl/libssl3t64_3.5.4-1~deb13u2_amd64.deb', '4a832fbdfc6ae292e4846eab6a6bf3687958c37ebcfd970e49169774d66d1231' ],
  [ 'https://security.debian.org/debian-security/pool/updates/main/o/openssl/libssl3t64_3.5.4-1~deb13u2_arm64.deb', 'bf08516b135862e5284635ac300189ecfee25f26c9bad79a3599474e63ad4dc5' ],
  // update at 2026/03/04, check: https://packages.debian.org/search?keywords=libjemalloc2
  [ 'https://ftp.debian.org/debian/pool/main/j/jemalloc/libjemalloc2_5.3.0-3_amd64.deb', 'e7d64919e620e8ea46960104efe1e9c977d751e5b610a5d89b0b51aeae9530d7' ],
  [ 'https://ftp.debian.org/debian/pool/main/j/jemalloc/libjemalloc2_5.3.0-3_arm64.deb', '437c48a6d591579bc812fc583ff0f28ac34a7d5c36b7d4e9f4f8809650430f3e' ]
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
// update at 2026/03/04, check version mapping at: https://github.com/puppeteer/puppeteer/blob/main/versions.json
const RES_BROWSER = [ // [ "v24.37.5", { "chrome": "145.0.7632.77", "firefox": "stable_147.0.4" } ]
  [ 'https://security.debian.org/debian-security/pool/updates/main/c/chromium/chromium_145.0.7632.116-1~deb13u1_amd64.deb', '3889d73b2e1d45d883624696c327f7aa52bffcea876972850a86dee7330bc24d' ],
  [ 'https://security.debian.org/debian-security/pool/updates/main/c/chromium/chromium_145.0.7632.116-1~deb13u1_arm64.deb', '61099dc64b036d63a768b1ec554f3cec1730ba73c13140c062f7cec5ba422504' ],
  [ 'https://security.debian.org/debian-security/pool/updates/main/c/chromium/chromium-common_145.0.7632.116-1~deb13u1_amd64.deb', '4e93d9478864c15a16e04dffa6ad8587b35845060ab19a1289815edc36668b6d' ],
  [ 'https://security.debian.org/debian-security/pool/updates/main/c/chromium/chromium-common_145.0.7632.116-1~deb13u1_arm64.deb', '94b0227559787651de2ce21ae8ecd97792a581e4bb15abe71a7d27a3e0e95e45' ],
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
