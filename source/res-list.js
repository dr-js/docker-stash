const RES_CORE_DEB12 = [
  // update at 2024/12/19, start from: https://packages.debian.org/search?keywords=ca-certificates
  [ 'https://ftp.debian.org/debian/pool/main/c/ca-certificates/ca-certificates_20230311_all.deb '.trim(), '5308b9bd88eebe2a48be3168cb3d87677aaec5da9c63ad0cf561a29b8219115c' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/openssl_3.0.15-1~deb12u1_amd64.deb       '.trim(), 'c9c37660d902f2a43dfbbf619b3f5f413cee298d8f317829e3c11cfff9e174aa' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/openssl_3.0.15-1~deb12u1_arm64.deb       '.trim(), '28d03482e8c550bd65930bd41af99bbc9bff1125474010ccec9024ceffc39744' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/libssl3_3.0.15-1~deb12u1_amd64.deb       '.trim(), 'd7897e6c55a8d9e229dcf16b0b1d472d7f7be741b2b3b2ac624908ff63215a93' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/libssl3_3.0.15-1~deb12u1_arm64.deb       '.trim(), '468debe7aad7bd73592dcdbdab4d778558a4f538efd1b960f24e343fdbc0654d' ],
  // update at 2023/02/28, check: https://packages.debian.org/search?keywords=libjemalloc2
  [ 'https://ftp.debian.org/debian/pool/main/j/jemalloc/libjemalloc2_5.3.0-1_amd64.deb          '.trim(), 'a4117c23c5c8acf6c9678a6cb086f000b79476369da7efe8a78a70826956ad3d' ],
  [ 'https://ftp.debian.org/debian/pool/main/j/jemalloc/libjemalloc2_5.3.0-1_arm64.deb          '.trim(), '866eba7688ec5cbb98200a05540c4909df6320557371b634b5d394cd32b9f252' ]
]

const RES_NODE = [
  // update at 2025/02/14, check: ".github/check-layer-package-latest.js"
  [ 'https://deb.nodesource.com/node_20.x/pool/main/n/nodejs/nodejs_20.18.3-1nodesource1_amd64.deb', '5ca8dda65890dfb4aa8eb060c3a502aa3e5775d7362ed741b2613fa5cc58ba55' ],
  [ 'https://deb.nodesource.com/node_20.x/pool/main/n/nodejs/nodejs_20.18.3-1nodesource1_arm64.deb', 'a2dfe2d71946b89ef31b6c150c8c1e98925cc6efc2b73c48199d2b8c151c4cf6' ],
  // update at 2024/08/05, check: `{ npm view npm@next-10; npm view @dr-js/core@latest; npm view @dr-js/dev@latest; } | grep -e tarball -e integrity`
  [ 'https://registry.npmjs.org/npm/-/npm-10.9.2.tgz          '.trim(), 'iriPEPIkoMYUy3F6f3wwSZAU93E0Eg6cHwIR6jzzOXWSy+SD/rOODEs74cVONHKSx2obXtuUoyidVEhISrisgQ==:sha512:base64' ],
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
  // update at 2025/02/14, use 2nd-recent-minor version, check: https://go.dev/dl/
  [ 'https://go.dev/dl/go1.23.6.linux-amd64.tar.gz', '9379441ea310de000f33a4dc767bd966e72ab2826270e038e78b2c53c2e7802d' ],
  [ 'https://go.dev/dl/go1.23.6.linux-arm64.tar.gz', '561c780e8f4a8955d32bf72e46af0b5ee5e0debe1e4633df9a03781878219202' ]
]
// update at 2025/02/14, check: ".github/check-layer-package-latest.js"
const RES_F_BIT_DEB12 = [
  [ 'https://packages.fluentbit.io/debian/bookworm/pool/main/f/fluent-bit/fluent-bit_3.2.6_amd64.deb', 'd3104d1ef5c3aef4487d8802e35de413e2b8e9e9411560b39f825519e04be247' ],
  [ 'https://packages.fluentbit.io/debian/bookworm/pool/main/f/fluent-bit/fluent-bit_3.2.6_arm64.deb', 'e707a5521067ec19f8c3f35a0b9802a04671c49ce61effb23bd04220120449ab' ]
]
// update at 2024/06/25, from: https://www.ruby-lang.org/en/downloads/releases/
// TODO: Ruby 2.7 reaches EOL
const RES_RUBY2 = [
  [ 'https://cache.ruby-lang.org/pub/ruby/2.7/ruby-2.7.8.tar.gz', 'c2dab63cbc8f2a05526108ad419efa63a67ed4074dbbcf9fc2b1ca664cb45ba0' ],
  // for manual build openssl1.1 on Deb12, check: https://github.com/rbenv/ruby-build/discussions/1940#discussioncomment-3724881
  // update at 2024/06/25, check: https://github.com/rbenv/ruby-build/blob/v20240612/share/ruby-build/2.7.8
  [ 'https://www.openssl.org/source/openssl-1.1.1w.tar.gz', 'cf3098950cb4d853ad95c0841f1f9c6d3dc102dccfcacd521d93925208b76ac8' ]
]
// TODO: NOTE:
//   temp revert & wait for "Compatibility issues" fix since "3.3.0": https://www.ruby-lang.org/en/news/2023/12/25/ruby-3-3-0-released/
//   temp revert & wait for "Compatibility issues" fix since "3.2.0": https://www.ruby-lang.org/en/news/2022/12/25/ruby-3-2-0-released/
//   const RES_RUBY3 = [ [ 'https://cache.ruby-lang.org/pub/ruby/3.3/ruby-3.3.3.tar.gz', '83c05b2177ee9c335b631b29b8c077b4770166d02fa527f3a9f6a40d13f3cce2' ] ]
const RES_RUBY3 = [ [ 'https://cache.ruby-lang.org/pub/ruby/3.1/ruby-3.1.6.tar.gz', '0d0dafb859e76763432571a3109d1537d976266be3083445651dc68deed25c22' ] ]

// update at 2024/08/05, check version at: https://github.com/puppeteer/puppeteer/releases
// and version mapping from Chrome => Puppeteer: https://github.com/puppeteer/puppeteer/blob/main/versions.json
const PPTR_VER = '22.15.0' // [ 'v22.15.0', { "chrome": "127.0.6533.88", "firefox": "latest" } ]
const PPTR_VER_ARM64_DEB12 = '22.15.0' // [ 'v22.15.0' , { "chrome": "127.0.6533.88", "firefox": "latest" } ]
// https://packages.debian.org/bookworm/chromium (133.0.6943.53-1~deb12u1)
// https://packages.debian.org/bookworm/firefox-esr (128.7.0esr-1~deb12u1)

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
