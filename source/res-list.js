const RES_CORE_DEB13 = [
  // update at 2026/11/24, start from: https://packages.debian.org/search?keywords=ca-certificates
  [ 'https://ftp.debian.org/debian/pool/main/c/ca-certificates/ca-certificates_20250419+deb13u1_all.deb', 'c10585ac22c7f617a73d394eea29ba71d0356f350ae973b19043d1b017f80f54' ], // <all> ca-certificates (20250419+deb13u1)
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/openssl_3.5.9-1~deb13u1_amd64.deb', 'faf53a993766c81f94f35b6a31202f0dcd936e1529791790a393aa59f41c0993' ], // <amd64> openssl (3.5.9-1~deb13u1)
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/openssl_3.5.9-1~deb13u1_arm64.deb', 'fe9c979716871f260fa50a920298036896677dd0a74a34c5589c18635cdef4b5' ], // <arm64> openssl (3.5.9-1~deb13u1)
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/libssl3t64_3.5.9-1~deb13u1_amd64.deb', 'ffefb9af363e0e4592251b2533eb06453c8e470f7772e40263c4b2129251a6d5' ], // <amd64> libssl3t64 (3.5.9-1~deb13u1)
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/libssl3t64_3.5.9-1~deb13u1_arm64.deb', '18edc2b123e8e81efcc14ea5502454b4505285aa9d3325c22315e9304acb25ca' ], // <arm64> libssl3t64 (3.5.9-1~deb13u1)
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
  // update at 2026/11/24, use Stable version, check: https://nginx.org/en/download.html
  // and: https://github.com/google/ngx_brotli
  [ 'https://nginx.org/download/nginx-1.30.8.tar.gz             '.trim(), 'f867314ada32e717b949930859656c48a72dc6657aec598db58af2f98a40e1c1' ], // TODO: need to calc hash yourself
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

// update at 2026/11/24, for `puppeteer-core`, check browser version mapping at: https://github.com/puppeteer/puppeteer/blob/main/versions.json
const PPTR_VER = '25.18.0' // [ "v25.18.0", { "chrome": "157.0.8103.78", "firefox": "stable_160.0" } ] 
const RES_CHROME_HLSH = [ // `chrome-headless-shell` is smaller, faster, and need much less lib than `chromium`, check https://developer.chrome.com/blog/chrome-headless-shell
  [ 'https://storage.googleapis.com/chrome-for-testing-public/158.0.8127.88/linux64/chrome-headless-shell-linux64.zip', 'H3PoWE72ADi565OU5pDvNQ==:md5:base64', 'chrome-hlsh-amd64.zip' ], // <amd64> chrome-headless-shell
  [ 'https://storage.googleapis.com/chrome-for-testing-public/158.0.8127.88/linux-arm64/chrome-headless-shell-linux-arm64.zip', 'S1nQSGtiFMNSnU01oZM4Wg==:md5:base64', 'chrome-hlsh-arm64.zip' ], // <arm64> chrome-headless-shell
]
// update at 2026/11/20, use official deb from mozilla
const RES_FIREFOX = [
  [ 'https://packages.mozilla.org/apt/pool/mozilla/firefox_160.0~build1_amd64_3cb999f6d19c84ab5cde987ef431ecb8.deb', 'aab3c9795fa34d07bf1d675cdb326b1c2c16634ac41ed5c5dde171a6625fc580' ], // <amd64> firefox
  [ 'https://packages.mozilla.org/apt/pool/mozilla/firefox_160.0~build1_arm64_54941e6f566d404ddf8ec8ad6f4469a3.deb', 'd56aac0662a4ec87b5aab1734d9fbd1c24a566ee5153c12199def1563ab7d9b4' ], // <arm64> firefox
]

// update at 2026/11/24, use official deb from ubuntu
const RES_MYSQL80 = [
  [ 'https://archive.ubuntu.com/ubuntu/pool/main/m/mysql-8.0/mysql-client-core-8.0_8.0.46-0ubuntu0.24.04.5_amd64.deb', '2169302de2db7d832bad5428d34492af558b806b8d91ffbc4536da62ab714743' ], // <amd64> mysql-client-core-8.0
  [ 'https://ports.ubuntu.com//////////pool/main/m/mysql-8.0/mysql-client-core-8.0_8.0.46-0ubuntu0.24.04.5_arm64.deb', '7aebefd45870f237a59a2397523194331ce46033a1d0ffd1ab87752f9518b074' ], // <arm64> mysql-client-core-8.0
  [ 'https://archive.ubuntu.com/ubuntu/pool/main/i/icu/libicu74_74.2-1ubuntu3.1_amd64.deb', 'c9a70989678660eed9a1e904c74fa043da8bec8e2036856fc16e31ced79b04f8' ], // <amd64> libicu74
  [ 'https://ports.ubuntu.com//////////pool/main/i/icu/libicu74_74.2-1ubuntu3.1_arm64.deb', '48f93acf50dcf237a8d58ce366730a28438ce52d3f06d7a2a88b51261dd791f7' ], // <arm64> libicu74
  [ 'https://archive.ubuntu.com/ubuntu/pool/main/m/mysql-8.0/mysql-server-core-8.0_8.0.46-0ubuntu0.24.04.5_amd64.deb', 'dcdaa64514e05f6c1f4e19767d094392c37495f2917d7c3384f21fd90ff7e8dd' ], // <amd64> mysql-server-core-8.0
  [ 'https://ports.ubuntu.com//////////pool/main/m/mysql-8.0/mysql-server-core-8.0_8.0.46-0ubuntu0.24.04.5_arm64.deb', 'f48dfa7716bec3be6335d52bad8e05309ad774eebe0299c2d2ec5d369379b744' ], // <arm64> mysql-server-core-8.0
]

// update at 2026/11/24, use official deb from postgresql.org
const RES_PGSQL18 = [
  [ 'https://ftp.postgresql.org/pub/repos/apt/pool/main/p/postgresql-19/libpq5_19.0-2.pgdg13+1_amd64.deb', '59bbd0c699f9f08567afbfe080d8db70b386a27562e0f3b47a214e7a39ee40ac' ], // <amd64> libpq5
  [ 'https://ftp.postgresql.org/pub/repos/apt/pool/main/p/postgresql-19/libpq5_19.0-2.pgdg13+1_arm64.deb', 'e411d9edde557bb9f8cd4ca527ea52105116ee22c08d1d0dbc108216001247da' ], // <arm64> libpq5
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
