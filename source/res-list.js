const RES_CORE_DEB13 = [
  // update at 2026/10/21, start from: https://packages.debian.org/search?keywords=ca-certificates
  [ 'https://security.debian.org/debian-security/pool/updates/main/c/ca-certificates/ca-certificates_20250419+deb13u1_all.deb', 'c10585ac22c7f617a73d394eea29ba71d0356f350ae973b19043d1b017f80f54' ], // <all> ca-certificates (20250419+deb13u1)
  [ 'https://security.debian.org/debian-security/pool/updates/main/o/openssl/openssl_3.5.7-1~deb13u3_amd64.deb', '43a9cbcf2a8a0e1f0a1c3f5a33ee1f56b269690e7a2129f2b2d0582e789589d7' ], // <amd64> openssl (3.5.7-1~deb13u3)
  [ 'https://security.debian.org/debian-security/pool/updates/main/o/openssl/openssl_3.5.7-1~deb13u3_arm64.deb', '68f226057a7a1c1f23e2ffde0075ea16e27e646d829c8d3c63414c49b839c258' ], // <arm64> openssl (3.5.7-1~deb13u3)
  [ 'https://security.debian.org/debian-security/pool/updates/main/o/openssl/libssl3t64_3.5.7-1~deb13u3_amd64.deb', 'ff16bc048bcd7d1b256094450b79c77947d8e76fe2a24bd99b91021d591fa074' ], // <amd64> libssl3t64 (3.5.7-1~deb13u3)
  [ 'https://security.debian.org/debian-security/pool/updates/main/o/openssl/libssl3t64_3.5.7-1~deb13u3_arm64.deb', 'd0681293a160392186c6ef85a165e40603d1628a099936137d24d391bd591f97' ], // <arm64> libssl3t64 (3.5.7-1~deb13u3)
  // update at 2026/03/04, check: https://packages.debian.org/search?keywords=libjemalloc2
  [ 'https://ftp.debian.org/debian/pool/main/j/jemalloc/libjemalloc2_5.3.0-3_amd64.deb', 'e7d64919e620e8ea46960104efe1e9c977d751e5b610a5d89b0b51aeae9530d7' ], // <amd64> libjemalloc2 (5.3.0-3)
  [ 'https://ftp.debian.org/debian/pool/main/j/jemalloc/libjemalloc2_5.3.0-3_arm64.deb', '437c48a6d591579bc812fc583ff0f28ac34a7d5c36b7d4e9f4f8809650430f3e' ], // <arm64> libjemalloc2 (5.3.0-3)
]

const RES_NODE = [
  // update at 2026/11/20, check: https://nodejs.org/download/release/latest-v24.x/SHASUMS256.txt
  [ 'https://nodejs.org/download/release/latest-v24.x/node-v24.22.3-linux-x64.tar.gz  '.trim(), '061ec3e3062115705b56b51fa9cc330ab50d34b6969387d4e4b1a50c6809acc2', 'node-@@@-amd64.tar.gz' ], // NOTE: fix filename
  [ 'https://nodejs.org/download/release/latest-v24.x/node-v24.22.3-linux-arm64.tar.gz'.trim(), '261af2af250dfd7e9f25cf151d1b2713a0adf8f10a9ad116c4947f68627affe8', 'node-@@@-arm64.tar.gz' ], // NOTE: fix filename
  // update at 2026/11/20, check: `{ npm view npm@next-11; npm view @dr-js/core@latest; npm view @dr-js/dev@latest; } | grep -e tarball -e integrity`
  [ 'https://registry.npmjs.org/npm/-/npm-11.21.3.tgz         '.trim(), '5Cf+jE+XctbhH/zjOOqXC+ity7eec/Tkk4Ql38tf6w+1htp2wYPHmE4c1R1Es3DY227Ac14+SLrlYJwkBicbTg==:sha512:base64' ],
  [ 'https://registry.npmjs.org/@dr-js/core/-/core-0.5.17.tgz '.trim(), 'xHPK1TEXbvTKyH1UafKZFWqSqZZaYEtTLZ6hVEvYasmm3sFSUPA0rbw/r1DPGRJ7QlLkdzCewS4t11C1B9l0DA==:sha512:base64', 'dr-js-@@@.tgz' ], // NOTE: fix filename
  [ 'https://registry.npmjs.org/@dr-js/dev/-/dev-0.5.14.tgz   '.trim(), 'KWwHsqxHrOtuVNPTq2chms7bXsQnti05UXp7dQIWUGVqOC+nQs6uN1KlIRqwJXZ5eo2pZnNCjk+GQ3RcpEyfjg==:sha512:base64', 'dr-dev-@@@.tgz' ], // NOTE: fix filename
]
const RES_NGINX = [
  // update at 2026/11/20, use Stable version, check: https://nginx.org/en/download.html
  // and: https://github.com/google/ngx_brotli
  [ 'https://nginx.org/download/nginx-1.30.7.tar.gz             '.trim(), '2565b5c837050e958f70fb0f73c48e2bca4542ad349fd356f46fb0c72610bc6e' ], // TODO: need to calc hash yourself
  [ 'https://github.com/google/brotli/archive/ed738e84.zip      '.trim(), 'a68ec12a898abc9cf248f21362620562041b7aab4d623ecd736f39bedf5002a0', 'brotli.zip' ], // specify filename // TODO: need to calc hash yourself
  [ 'https://github.com/google/ngx_brotli/archive/a71f9312.zip  '.trim(), '96f23eb72488ffc570cbc474a928000b05b72f2682456ae357aeaf3ce71c626e', 'ngx-brotli.zip' ], // specify filename // TODO: need to calc hash yourself
]
const RES_GO = [
  // update at 2026/11/20, use 2nd-recent-minor version if latest version's patch version < 2, check: https://go.dev/dl/
  [ 'https://go.dev/dl/go1.27.4.linux-amd64.tar.gz', '7226736c2339719cda28fbf3a54d71aa63bcefe376e98cef00034268dab24840' ],
  [ 'https://go.dev/dl/go1.27.4.linux-arm64.tar.gz', '3392582988a273a87ab5043ee1b2c9c17a2c3c00580bf9326c47a2e0aaaeac92' ],
]
// update at 2026/11/20, check: ".github/check-layer-package-latest.js"
const RES_F_BIT_DEB13 = [
  [ 'https://packages.fluentbit.io/debian/trixie/pool/main/f/fluent-bit/fluent-bit_5.2.0_amd64.deb', '7e41079b9ded60d5714057b54e608c89046b4764b72a3e7c1d760c6929cf4b2f' ], // <amd64> fluent-bit
  [ 'https://packages.fluentbit.io/debian/trixie/pool/main/f/fluent-bit/fluent-bit_5.2.0_arm64.deb', '96de921a56c9040dab00a52215d86cc33fbe423972e2477dedfd89d0ae18ba10' ], // <arm64> fluent-bit
]
// update at 2026/11/20, from: https://www.ruby-lang.org/en/downloads/releases/
const RES_RUBY3 = [ [ 'https://cache.ruby-lang.org/pub/ruby/3.4/ruby-3.4.13.tar.gz', 'd0d3bf3dd8c224a3c3b7ecd816a0f1b2cbcf4f87b5afcbdbe91d3fef177f351a' ] ]

// update at 2026/11/20, for `puppeteer-core`, check browser version mapping at: https://github.com/puppeteer/puppeteer/blob/main/versions.json
const PPTR_VER = '25.18.0' // [ "v25.18.0", { "chrome": "157.0.8103.78", "firefox": "stable_160.0" } ] 
const RES_CHROME_HLSH = [ // `chrome-headless-shell` is smaller, faster, and need much less lib than `chromium`, check https://developer.chrome.com/blog/chrome-headless-shell
  [ 'https://storage.googleapis.com/chrome-for-testing-public/158.0.8127.36/linux64/chrome-headless-shell-linux64.zip', 'I+KTzx+V+qWQSTfi0zLn0w==:md5:base64', 'chrome-hlsh-amd64.zip' ], // <amd64> chrome-headless-shell
  [ 'https://storage.googleapis.com/chrome-for-testing-public/158.0.8127.36/linux-arm64/chrome-headless-shell-linux-arm64.zip', 'bc3ui1NTVjLReNyTsdTW9A==:md5:base64', 'chrome-hlsh-arm64.zip' ], // <arm64> chrome-headless-shell
]
// update at 2026/11/20, use official deb from mozilla
const RES_FIREFOX = [
  [ 'https://packages.mozilla.org/apt/pool/mozilla/firefox_160.0~build1_amd64_3cb999f6d19c84ab5cde987ef431ecb8.deb', 'aab3c9795fa34d07bf1d675cdb326b1c2c16634ac41ed5c5dde171a6625fc580' ], // <amd64> firefox
  [ 'https://packages.mozilla.org/apt/pool/mozilla/firefox_160.0~build1_arm64_54941e6f566d404ddf8ec8ad6f4469a3.deb', 'd56aac0662a4ec87b5aab1734d9fbd1c24a566ee5153c12199def1563ab7d9b4' ], // <arm64> firefox
]

// update at 2026/09/16, use official deb from ubuntu
const RES_MYSQL80 = [
  [ 'https://kr.archive.ubuntu.com/ubuntu/pool/main/m/mysql-8.0/mysql-client-core-8.0_8.0.46-0ubuntu0.24.04.4_amd64.deb', '0a83b500effa91ce7f7eb3f2c9c8b6e284c51230850dc0dd3b2b25dd54d624a5' ], // <amd64> mysql-client-core-8.0 (8.0.46-0ubuntu0.24.04.4)
  [ 'https://ports.ubuntu.com/////////////pool/main/m/mysql-8.0/mysql-client-core-8.0_8.0.46-0ubuntu0.24.04.4_arm64.deb', '641eb958b07497de25a9e7a14fa3fbbdb193a3445d2fcd36686f5788e16639b3' ], // <arm64> mysql-client-core-8.0 (8.0.46-0ubuntu0.24.04.4)
  [ 'https://kr.archive.ubuntu.com/ubuntu/pool/main/i/icu/libicu74_74.2-1ubuntu3.1_amd64.deb', 'c9a70989678660eed9a1e904c74fa043da8bec8e2036856fc16e31ced79b04f8' ], // <amd64> libicu74 (74.2-1ubuntu3.1)
  [ 'https://ports.ubuntu.com/////////////pool/main/i/icu/libicu74_74.2-1ubuntu3.1_arm64.deb', '48f93acf50dcf237a8d58ce366730a28438ce52d3f06d7a2a88b51261dd791f7' ], // <arm64> libicu74 (74.2-1ubuntu3.1)
  [ 'https://kr.archive.ubuntu.com/ubuntu/pool/main/m/mysql-8.0/mysql-server-core-8.0_8.0.46-0ubuntu0.24.04.4_amd64.deb', 'a12f80479f2ba37b88670ecff246584fa8d27251104d2e5066777c4ea73d8d32' ], // <amd64> mysql-server-core-8.0 (8.0.46-0ubuntu0.24.04.4)
  [ 'https://ports.ubuntu.com/////////////pool/main/m/mysql-8.0/mysql-server-core-8.0_8.0.46-0ubuntu0.24.04.4_arm64.deb', '802a8c487520066e2fe960f8691ecbdaaf98dce03494795e55dde8db4689ea8e' ], // <arm64> mysql-server-core-8.0 (8.0.46-0ubuntu0.24.04.4)
]

// update at 2026/11/20, use official deb from postgresql.org
const RES_PGSQL18 = [
  [ 'https://ftp.postgresql.org/pub/repos/apt/pool/main/p/postgresql-19/libpq5_19.0-1.pgdg13+1_amd64.deb', '4ce01150bf7ac1f77a9ab556a252a89f8d95dcd84779dc356f077cccc9bde8b1' ], // <amd64> libpq5
  [ 'https://ftp.postgresql.org/pub/repos/apt/pool/main/p/postgresql-19/libpq5_19.0-1.pgdg13+1_arm64.deb', '5cb5f7376d79748c8ba1178bbd60a4777ef31720e3c799db4516d24263618680' ], // <arm64> libpq5
  [ 'https://ftp.postgresql.org/pub/repos/apt/pool/main/p/postgresql-common/postgresql-client-common_297.pgdg13+1_all.deb', '450b72119c9169656a4043daca9a80c31eea60e4921f42b4657d68c3886a3d4a' ], // <all> postgresql-client-common
  [ 'https://ftp.postgresql.org/pub/repos/apt/pool/main/p/postgresql-18/postgresql-client-18_18.7-1.pgdg13+5_amd64.deb', '7fe43472fc8eb12f7d3f376fcb2c809f659c3d5722e4d13dd8834066cd6a289b' ], // <amd64> postgresql-client-18
  [ 'https://ftp.postgresql.org/pub/repos/apt/pool/main/p/postgresql-18/postgresql-client-18_18.7-1.pgdg13+5_arm64.deb', '8f563ae7befe5075bab5599d46b6528b816c8f9aba3cae08dea29385348ee38a' ], // <arm64> postgresql-client-18
  [ 'https://ftp.postgresql.org/pub/repos/apt/pool/main/p/postgresql-common/postgresql-common_297.pgdg13+1_all.deb', '4a0a08e28828a1dd2545b7484ec814e656e032ff4eea6c82881f903a0cee68a7' ], // <all> postgresql-common
  [ 'https://ftp.postgresql.org/pub/repos/apt/pool/main/p/postgresql-18/postgresql-18_18.7-1.pgdg13+5_amd64.deb', 'c3c67b3eff04872768ba8f001dfd1c71486ec0f0c77d67afc0fe7943930ce3c7' ], // <amd64> postgresql-18
  [ 'https://ftp.postgresql.org/pub/repos/apt/pool/main/p/postgresql-18/postgresql-18_18.7-1.pgdg13+5_arm64.deb', '79d0ac26c6fdf39e1bb16d746109e8a94e78e09f4b8039beec596e27ab41652b' ], // <arm64> postgresql-18
]

// update at 2026/11/20, from: https://hub.docker.com/r/valkey/valkey/tags?name=9.1.4
const IMG_VALKEY9 = 'valkey/valkey:9.1.4-trixie'

module.exports = {
  RES_CORE_DEB13,

  RES_NODE,
  RES_NGINX,
  RES_GO,
  RES_F_BIT_DEB13,

  RES_RUBY3,

  PPTR_VER, RES_CHROME_HLSH, RES_FIREFOX,

  RES_MYSQL80, RES_PGSQL18, IMG_VALKEY9,
}
