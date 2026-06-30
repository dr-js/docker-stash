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
  // update at 2026/03/20, check: `{ npm view npm@next-11; npm view @dr-js/core@latest; npm view @dr-js/dev@latest; } | grep -e tarball -e integrity`
  [ 'https://registry.npmjs.org/npm/-/npm-11.12.0.tgz         '.trim(), 'xPhOap4ZbJWyd7DAOukP564WFwNSGu/2FeTRFHhiiKthcauxhH/NpkJAQm24xD+cAn8av5tQ00phi98DqtfLsg==:sha512:base64' ],
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
  // update at 2026/03/20, use 2nd-recent-minor version, check: https://go.dev/dl/
  [ 'https://go.dev/dl/go1.25.8.linux-amd64.tar.gz', 'ceb5e041bbc3893846bd1614d76cb4681c91dadee579426cf21a63f2d7e03be6' ],
  [ 'https://go.dev/dl/go1.25.8.linux-arm64.tar.gz', '7d137f59f66bb93f40a6b2b11e713adc2a9d0c8d9ae581718e3fad19e5295dc7' ]
]
// update at 2026/03/04, check: ".github/check-layer-package-latest.js"
const RES_F_BIT_DEB13 = [
  [ 'https://packages.fluentbit.io/debian/trixie/pool/main/f/fluent-bit/fluent-bit_4.2.3_amd64.deb', '4e8a30a77137ec10c2a255f628334d1381b008d354973a2ff701520b6ebcfd59' ],
  [ 'https://packages.fluentbit.io/debian/trixie/pool/main/f/fluent-bit/fluent-bit_4.2.3_arm64.deb', '09df2f288a2ce5f36ce5f762d442e84f3038cebbf002da27580abf58c588f94f' ]
]
// update at 2025/03/20, from: https://www.ruby-lang.org/en/downloads/releases/
const RES_RUBY3 = [ [ 'https://cache.ruby-lang.org/pub/ruby/3.4/ruby-3.4.9.tar.gz', '7bb4d4f5e807cc27251d14d9d6086d182c5b25875191e44ab15b709cd7a7dd9c' ] ]

// update at 2026/03/23, for `puppeteer-core`, check browser version mapping at: https://github.com/puppeteer/puppeteer/blob/main/versions.json
const PPTR_VER = '24.37.5' // [ "v24.37.5", { "chrome": "145.0.7632.77", "firefox": "stable_147.0.4" } ]
// update at 2026/03/23, default use "stable" version at: https://hub.docker.com/r/chromedp/headless-shell/tags
// bad version: 146.0.7680.154, will spawn 2 extra Z-state headless-shell process
// bad version: 146.0.7680.31, check: https://github.com/chromedp/chromedp/issues/1619 and https://github.com/chromedp/chromedp/issues/1621
const IMG_CHROMEDP = 'chromedp/headless-shell:145.0.7632.117'
// update at 2026/03/04, use official deb from mozilla
const RES_FIREFOX = [
  [ 'https://packages.mozilla.org/apt/pool/mozilla/firefox_148.0~build1_amd64_2ed57f9938e0e3b6210a7fb3d7904e73.deb', 'c714ae7c4248f16087b29645bc8f0b9a73aa4e70aa7fb3c2632703f2a311fd83' ],
  [ 'https://packages.mozilla.org/apt/pool/mozilla/firefox_148.0~build1_arm64_59718f33bff5c8c5ddf4d5bb140d4c13.deb', '104755fd66eda9c7cf8368d294c9488f0591283cfe61ecbeb5093905862a1d37' ]
]

// update at 2026/06/30, use official deb from ubuntu
const RES_MYSQL84 = [
  [ 'https://mirrors.kernel.org/ubuntu//pool/main/g/google-perftools/libtcmalloc-minimal4t64_2.18.1-1_amd64.deb', 'b1b769749befa42696d8368c8124afe1f2c522282b9520224304a43fdf7155d9' ],
  [ 'https://ports.ubuntu.com///////////pool/main/g/google-perftools/libtcmalloc-minimal4t64_2.18.1-1_arm64.deb', 'd36065a2ccf246bb479a40e85498f56a298cafc41a6ed79b329ceb1a71aadd8d' ],
  [ 'https://mirrors.kernel.org/ubuntu//pool/main/g/google-perftools/libgoogle-perftools4t64_2.18.1-1_amd64.deb', '62cd52ab2f569f26d6a6db26cb9963191f24196bef7b4d25762aca6cdc94e856' ],
  [ 'https://ports.ubuntu.com///////////pool/main/g/google-perftools/libgoogle-perftools4t64_2.18.1-1_arm64.deb', '205894fbb01efc1727deaa9b03284266a075aa6395b73ec80f7d4ccd38921dbd' ],
  [ 'https://security.ubuntu.com/ubuntu/pool/main/m/mysql-8.4/mysql-client-core_8.4.10-0ubuntu0.26.04.1_amd64.deb', '8905e8784f8698636d4705adfe25de6542a99db69023c14573c063ad181aab64' ],
  [ 'https://ports.ubuntu.com///////////pool/main/m/mysql-8.4/mysql-client-core_8.4.10-0ubuntu0.26.04.1_arm64.deb', 'ab654f9527ff0edeba72c69a341ba105273671caadec24d1b00084a9b1434e57' ],
  [ 'https://mirrors.kernel.org/ubuntu//pool/main/i/icu/libicu78_78.2-2ubuntu1_amd64.deb', 'c8b97930f9e365d6d00978144b468ac8397ef07d2fb2c453869f05fc3a98c4ca' ],
  [ 'https://ports.ubuntu.com///////////pool/main/i/icu/libicu78_78.2-2ubuntu1_arm64.deb', 'b5c465f39aa3f13cb9840007a195053af81b35b372c769d9ee26a11625088980' ],
  [ 'https://security.ubuntu.com/ubuntu/pool/main/m/mysql-8.4/mysql-server-core_8.4.10-0ubuntu0.26.04.1_amd64.deb', '05c8caf9eb3a036dd7133d65a91939cc4d2c46a32bcce95d934aeb8806ab80de' ],
  [ 'https://ports.ubuntu.com///////////pool/main/m/mysql-8.4/mysql-server-core_8.4.10-0ubuntu0.26.04.1_arm64.deb', 'e92d332c42a202479ea00f749d8120fbbb578ee868efd0f65b637f2090f8aa99' ],
]

// update at 2026/03/16, borrow: https://github.com/redis/docker-library-redis/blob/d42d7aec93b1c54dd46f37a66a92f62478456039/6.2/debian/Dockerfile
const RES_REDIS6 = [
  [ 'https://download.redis.io/releases/redis-6.2.21.tar.gz', '6383b32ba8d246f41bbbb83663381f5a5f4c4713235433cec22fc4a47e9b6d5f' ]
]

module.exports = {
  RES_CORE_DEB13,

  RES_NODE,
  RES_NGINX,
  RES_GO,
  RES_F_BIT_DEB13,

  RES_RUBY3,

  PPTR_VER, IMG_CHROMEDP, RES_FIREFOX,

  RES_MYSQL84, RES_REDIS6
}
