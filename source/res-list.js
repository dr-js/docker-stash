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
  // update at 2026/10/22, check: https://nodejs.org/download/release/latest-v24.x/SHASUMS256.txt
  [ 'https://nodejs.org/download/release/latest-v24.x/node-v24.22.1-linux-x64.tar.gz  '.trim(), 'eb6728e77c576a35162c122c45ccadf224d89ff00abc8dae46cc2897c6002d7c', 'node-@@@-amd64.tar.gz' ], // NOTE: fix filename
  [ 'https://nodejs.org/download/release/latest-v24.x/node-v24.22.1-linux-arm64.tar.gz'.trim(), '33c37be234ba8bee041961047b19160f4d7d0f164e8e246f78bdd10feff148b3', 'node-@@@-arm64.tar.gz' ], // NOTE: fix filename
  // update at 2026/10/21, check: `{ npm view npm@next-11; npm view @dr-js/core@latest; npm view @dr-js/dev@latest; } | grep -e tarball -e integrity`
  [ 'https://registry.npmjs.org/npm/-/npm-11.21.1.tgz         '.trim(), 'YTzL6QBEJXyHcTu0JiUc7RKMp+mzlJtl7rGLmERaXUQeFHIMc9atdr6G9M9C8vDWbv40epoTQAzNL2/PtZVDhQ==:sha512:base64' ],
  [ 'https://registry.npmjs.org/@dr-js/core/-/core-0.5.17.tgz '.trim(), 'xHPK1TEXbvTKyH1UafKZFWqSqZZaYEtTLZ6hVEvYasmm3sFSUPA0rbw/r1DPGRJ7QlLkdzCewS4t11C1B9l0DA==:sha512:base64', 'dr-js-@@@.tgz' ], // NOTE: fix filename
  [ 'https://registry.npmjs.org/@dr-js/dev/-/dev-0.5.14.tgz   '.trim(), 'KWwHsqxHrOtuVNPTq2chms7bXsQnti05UXp7dQIWUGVqOC+nQs6uN1KlIRqwJXZ5eo2pZnNCjk+GQ3RcpEyfjg==:sha512:base64', 'dr-dev-@@@.tgz' ], // NOTE: fix filename
]
const RES_NGINX = [
  // update at 2026/10/21, use Stable version, check: https://nginx.org/en/download.html
  // and: https://github.com/google/ngx_brotli
  [ 'https://nginx.org/download/nginx-1.30.6.tar.gz             '.trim(), '3cf46f5ed7504d460125866b7bea99fb357f31d887e2e63b35503310e9b8b6c8' ], // TODO: need to calc hash yourself
  [ 'https://github.com/google/brotli/archive/ed738e84.zip      '.trim(), 'a68ec12a898abc9cf248f21362620562041b7aab4d623ecd736f39bedf5002a0', 'brotli.zip' ], // specify filename // TODO: need to calc hash yourself
  [ 'https://github.com/google/ngx_brotli/archive/a71f9312.zip  '.trim(), '96f23eb72488ffc570cbc474a928000b05b72f2682456ae357aeaf3ce71c626e', 'ngx-brotli.zip' ], // specify filename // TODO: need to calc hash yourself
]
const RES_GO = [
  // update at 2026/10/21, use 2nd-recent-minor version if latest version's patch version < 2, check: https://go.dev/dl/
  [ 'https://go.dev/dl/go1.27.3.linux-amd64.tar.gz', '65efbc80fdc1fa2cd2631cad5b481777a68e8725f34e89f50fc6ac714e379b40' ],
  [ 'https://go.dev/dl/go1.27.3.linux-arm64.tar.gz', 'a06e99309dbcbdca1a8ccd2282c3ee146e55930886e26b4f1193269587165f49' ],
]
// update at 2026/10/22, check: ".github/check-layer-package-latest.js"
const RES_F_BIT_DEB13 = [
  [ 'https://packages.fluentbit.io/debian/trixie/pool/main/f/fluent-bit/fluent-bit_5.1.5_amd64.deb', '870b20feea2b4f4bf35066b06d031d5c0547bb4ad2f5cc5829619d86f97bbbb0' ], // <amd64> fluent-bit
  [ 'https://packages.fluentbit.io/debian/trixie/pool/main/f/fluent-bit/fluent-bit_5.1.5_arm64.deb', '4397e7f68cc023d09f31e91f3a87218159f0b78bd9b5d3c318a464bbfb11a63a' ], // <arm64> fluent-bit
]
// update at 2026/10/21, from: https://www.ruby-lang.org/en/downloads/releases/
const RES_RUBY3 = [ [ 'https://cache.ruby-lang.org/pub/ruby/3.4/ruby-3.4.11.tar.gz', '5c22be44524312b3d433d68739bcc530633b1da5ef8ba0afa0a37680da17d3de' ] ]

// update at 2025/08/31, for `puppeteer-core`, check browser version mapping at: https://github.com/puppeteer/puppeteer/blob/main/versions.json
const PPTR_VER = '24.43.1' // [ "v24.43.1", { "chrome": "148.0.7778.97", "firefox": "stable_150.0.2" } ] //  TODO: hold-off major ver bump // [ "v25.6.0", { "chrome": "151.0.7922.77", "firefox": "stable_153.0.3" } ]
// update at 2025/08/31, default use "stable" version at: https://hub.docker.com/r/chromedp/headless-shell/tags
// TODO: hold & wait fix for: Failing to start after chromium 150 update: https://github.com/chromedp/chromedp/issues/1635
//   or use chrome-headless-shell	linux64 & linux-arm64 at: https://googlechromelabs.github.io/chrome-for-testing/
const IMG_CHROMEDP = 'chromedp/headless-shell:148.0.7778.97'
// update at 2026/10/21, use official deb from mozilla
const RES_FIREFOX = [
  [ 'https://packages.mozilla.org/apt/pool/mozilla/firefox_158.0~build2_amd64_b6746f479be064a80282c8df25632748.deb', '06a608dd092b0ba2c7cb436df259025ffd006b16126bf1c0ab8121e869fdbebc' ], // <amd64> firefox
  [ 'https://packages.mozilla.org/apt/pool/mozilla/firefox_158.0~build2_arm64_cf523f4276139ced54b205479820b0aa.deb', 'd579b53ce7c31c624eb61079b8a0b4e9db3d97a8457257c42cac434064ee9726' ], // <arm64> firefox
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

// update at 2026/08/31, use official deb from postgresql.org
const RES_PGSQL18 = [
  [ 'https://ftp.postgresql.org/pub/repos/apt/pool/main/p/postgresql-18/libpq5_18.6-1.pgdg13+2_amd64.deb', 'c6cc459bb499db4697686533e50bf5943f7e7d6929c04ef55eec184d5436859b' ], // <amd64> libpq5
  [ 'https://ftp.postgresql.org/pub/repos/apt/pool/main/p/postgresql-18/libpq5_18.6-1.pgdg13+2_arm64.deb', '26d0c9de6c3939432d94d4ad74db1bd2899c87698e1f96f3ee9396054f44d5dc' ], // <arm64> libpq5
  [ 'https://ftp.postgresql.org/pub/repos/apt/pool/main/p/postgresql-common/postgresql-client-common_293.pgdg13+1_all.deb', '70da21264140dfb34680cfec52973c7f10b5c8e3c78699a52b04e870b3dee71b' ], // <all> postgresql-client-common
  [ 'https://ftp.postgresql.org/pub/repos/apt/pool/main/p/postgresql-18/postgresql-client-18_18.6-1.pgdg13+2_amd64.deb', '9af40c99f7074f8ff3798155af2f07f1a4e1e3bd4edce44ef928c1e03aea620e' ], // <amd64> postgresql-client-18
  [ 'https://ftp.postgresql.org/pub/repos/apt/pool/main/p/postgresql-18/postgresql-client-18_18.6-1.pgdg13+2_arm64.deb', '098492efc9f576ffee23e1871d31682b332a3c6582072d3ef8f99b6b72573bc7' ], // <arm64> postgresql-client-18
  [ 'https://ftp.postgresql.org/pub/repos/apt/pool/main/p/postgresql-common/postgresql-common_293.pgdg13+1_all.deb', 'c34ec06f618ed4bec388104d0183c7678876659dfa973e7a852046167288ac8c' ], // <all> postgresql-common
  [ 'https://ftp.postgresql.org/pub/repos/apt/pool/main/p/postgresql-18/postgresql-18_18.6-1.pgdg13+2_amd64.deb', 'bf4062a44757c3f7a207a1b9e20c2bf93f9847257516c2ce0befc1257d3dcf8e' ], // <amd64> postgresql-18
  [ 'https://ftp.postgresql.org/pub/repos/apt/pool/main/p/postgresql-18/postgresql-18_18.6-1.pgdg13+2_arm64.deb', '16d1f20450bfdc13118c317a86745ca1a0d56fe192c3d8f8091a7f2d9868c4d9' ], // <arm64> postgresql-18
]

// update at 2026/09/16, from: https://hub.docker.com/r/valkey/valkey/tags?name=9.1.2
const IMG_VALKEY9 = 'valkey/valkey:9.1.2-trixie'

module.exports = {
  RES_CORE_DEB13,

  RES_NODE,
  RES_NGINX,
  RES_GO,
  RES_F_BIT_DEB13,

  RES_RUBY3,

  PPTR_VER, IMG_CHROMEDP, RES_FIREFOX,

  RES_MYSQL80, RES_PGSQL18, IMG_VALKEY9,
}
