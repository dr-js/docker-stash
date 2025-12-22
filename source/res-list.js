const RES_CORE_DEB12 = [
  // update at 2025/12/19, start from: https://packages.debian.org/search?keywords=ca-certificates
  [ 'https://ftp.debian.org/debian/pool/main/c/ca-certificates/ca-certificates_20230311+deb12u1_all.deb         '.trim(), '0d5f444f594e48c1e16a41d8fc628a09b24c658916a1274025c2330f2a802bed' ],
  [ 'http://security.debian.org/debian-security/pool/updates/main/o/openssl/openssl_3.0.17-1~deb12u3_amd64.deb  '.trim(), '8d86ffbc3e49b8df1cdf47d0ebe76ce3c806d714724669646d21e222db1d293b' ],
  [ 'http://security.debian.org/debian-security/pool/updates/main/o/openssl/openssl_3.0.17-1~deb12u3_arm64.deb  '.trim(), '50026b5be10f609e9c607aa94465bbb8753a12e4a20f5b2b7e90450893df6490' ],
  [ 'http://security.debian.org/debian-security/pool/updates/main/o/openssl/libssl3_3.0.17-1~deb12u3_amd64.deb  '.trim(), '49a24ea92f19ee029e694107cfcf4f7e6298883a28e23a80ec999a0746d4a869' ],
  [ 'http://security.debian.org/debian-security/pool/updates/main/o/openssl/libssl3_3.0.17-1~deb12u3_arm64.deb  '.trim(), '35db1cc7b00b71689fd323eb37420a8fef3d2000e82d65ff959564fc27a5d2fc' ],
  // update at 2023/02/28, check: https://packages.debian.org/search?keywords=libjemalloc2
  [ 'https://ftp.debian.org/debian/pool/main/j/jemalloc/libjemalloc2_5.3.0-1_amd64.deb          '.trim(), 'a4117c23c5c8acf6c9678a6cb086f000b79476369da7efe8a78a70826956ad3d' ],
  [ 'https://ftp.debian.org/debian/pool/main/j/jemalloc/libjemalloc2_5.3.0-1_arm64.deb          '.trim(), '866eba7688ec5cbb98200a05540c4909df6320557371b634b5d394cd32b9f252' ]
]

const RES_NODE = [
  // update at 2025/12/19, check: https://nodejs.org/download/release/latest-v22.x/
  [ 'https://nodejs.org/download/release/latest-v22.x/node-v22.21.1-linux-x64.tar.gz  '.trim(), '219a152ea859861d75adea578bdec3dce8143853c13c5187f40c40e77b0143b2', 'node-@@@-amd64.tar.gz' ], // NOTE: fix filename
  [ 'https://nodejs.org/download/release/latest-v22.x/node-v22.21.1-linux-arm64.tar.gz'.trim(), 'c86830dedf77f8941faa6c5a9c863bdfdd1927a336a46943decc06a38f80bfb2', 'node-@@@-arm64.tar.gz' ], // NOTE: fix filename
  // update at 2025/12/19, check: `{ npm view npm@next-10; npm view @dr-js/core@latest; npm view @dr-js/dev@latest; } | grep -e tarball -e integrity`
  [ 'https://registry.npmjs.org/npm/-/npm-10.9.4.tgz          '.trim(), 'OnUG836FwboQIbqtefDNlyR0gTHzIfwRfE3DuiNewBvnMnWEpB0VEXwBlFVgqpNzIgYo/MHh3d2Hel/pszapAA==:sha512:base64' ],
  [ 'https://registry.npmjs.org/@dr-js/core/-/core-0.5.17.tgz '.trim(), 'xHPK1TEXbvTKyH1UafKZFWqSqZZaYEtTLZ6hVEvYasmm3sFSUPA0rbw/r1DPGRJ7QlLkdzCewS4t11C1B9l0DA==:sha512:base64', 'dr-js-@@@.tgz' ], // NOTE: fix filename
  [ 'https://registry.npmjs.org/@dr-js/dev/-/dev-0.5.14.tgz   '.trim(), 'KWwHsqxHrOtuVNPTq2chms7bXsQnti05UXp7dQIWUGVqOC+nQs6uN1KlIRqwJXZ5eo2pZnNCjk+GQ3RcpEyfjg==:sha512:base64', 'dr-dev-@@@.tgz' ] // NOTE: fix filename
]
const RES_NGINX = [
  // update at 2025/02/14, use Stable version, check: https://nginx.org/en/download.html
  // and: https://github.com/google/ngx_brotli
  [ 'https://nginx.org/download/nginx-1.26.3.tar.gz             '.trim(), '69ee2b237744036e61d24b836668aad3040dda461fe6f570f1787eab570c75aa' ], // TODO: need to calc hash yourself
  [ 'https://github.com/google/brotli/archive/ed738e84.zip      '.trim(), 'a68ec12a898abc9cf248f21362620562041b7aab4d623ecd736f39bedf5002a0', 'brotli.zip' ], // specify filename // TODO: need to calc hash yourself
  [ 'https://github.com/google/ngx_brotli/archive/a71f9312.zip  '.trim(), '96f23eb72488ffc570cbc474a928000b05b72f2682456ae357aeaf3ce71c626e', 'ngx-brotli.zip' ] // specify filename // TODO: need to calc hash yourself
]
const RES_GO = [
  // update at 2025/12/19, use 2nd-recent-minor version, check: https://go.dev/dl/
  [ 'https://go.dev/dl/go1.25.5.linux-amd64.tar.gz', '9e9b755d63b36acf30c12a9a3fc379243714c1c6d3dd72861da637f336ebb35b' ],
  [ 'https://go.dev/dl/go1.25.5.linux-arm64.tar.gz', 'b00b694903d126c588c378e72d3545549935d3982635ba3f7a964c9fa23fe3b9' ]
]
// update at 2025/06/03, check: ".github/check-layer-package-latest.js"
const RES_F_BIT_DEB12 = [
  [ 'https://packages.fluentbit.io/debian/bookworm/pool/main/f/fluent-bit/fluent-bit_3.2.10_amd64.deb', 'e9959ebce2e1aede5033caf686951d9b91d0d01833808290d9db6bbe79defc02' ],
  [ 'https://packages.fluentbit.io/debian/bookworm/pool/main/f/fluent-bit/fluent-bit_3.2.10_arm64.deb', 'dd70e11002f035e53a13d7d8475b64270068ff106b402ea7cecaf3a8f5529b8a' ]
]
// update at 2025/12/19, from: https://www.ruby-lang.org/en/downloads/releases/
const RES_RUBY3 = [ [ 'https://cache.ruby-lang.org/pub/ruby/3.4/ruby-3.4.8.tar.gz', '53c4ddad41fbb6189f1f5ee0db57a51d54bd1f87f8755b3d68604156a35b045b' ] ]

// update at 2025/12/19, for `puppeteer-core`, version need match `RES_BROWSER`
const PPTR_VER = '24.32.1'
// update at 2025/12/19, check version mapping at: https://github.com/puppeteer/puppeteer/blob/main/versions.json
const RES_BROWSER = [ // [ "v24.32.0", { "chrome": "143.0.7499.40", "firefox": "stable_145.0.2" } ]
  [ 'https://security.debian.org/debian-security/pool/updates/main/c/chromium/chromium_143.0.7499.109-1~deb12u1_amd64.deb', '72d45c0fd60dbde0045c94ec80cb00263cd44da723c61bc4d56b024cf4e831b0' ],
  [ 'https://security.debian.org/debian-security/pool/updates/main/c/chromium/chromium_143.0.7499.109-1~deb12u1_arm64.deb', 'bde6d3b8c9377d089f5636dc4fda79671e427cbcd5edf2105dff8699b19c53db' ],
  [ 'https://security.debian.org/debian-security/pool/updates/main/c/chromium/chromium-common_143.0.7499.109-1~deb12u1_amd64.deb', 'ee61af23b313d83008212398429b239cd70b764171e50060865311132b4d4ee7' ],
  [ 'https://security.debian.org/debian-security/pool/updates/main/c/chromium/chromium-common_143.0.7499.109-1~deb12u1_arm64.deb', '08e122833b66eb36864fce94dd769090f4b9a98a924dfe17c1dee9a7ebafe793' ],
  [ 'https://packages.mozilla.org/apt/pool/mozilla/firefox_146.0~build2_amd64_c2ff8b4b4a0dfee94ee870aef59904fd.deb', 'e9b15963793dda616f140c36f7efbe6dcc9b666b4dfce79accc6173adf1679e1' ],
  [ 'https://packages.mozilla.org/apt/pool/mozilla/firefox_146.0~build2_arm64_2d10044d0eb2bd8ddd20d949d0a4b724.deb', '6d90f7d18b2392d9bb274906834b665c3c6935bd8808821b430e4ad44dbae26a' ]
]

module.exports = {
  RES_CORE_DEB12,

  RES_NODE,
  RES_NGINX,
  RES_GO,
  RES_F_BIT_DEB12,

  RES_RUBY3,

  PPTR_VER, RES_BROWSER
}
