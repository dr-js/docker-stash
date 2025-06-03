const RES_CORE_DEB12 = [
  // update at 2025/06/03, start from: https://packages.debian.org/search?keywords=ca-certificates
  [ 'https://ftp.debian.org/debian/pool/main/c/ca-certificates/ca-certificates_20230311_all.deb '.trim(), '5308b9bd88eebe2a48be3168cb3d87677aaec5da9c63ad0cf561a29b8219115c' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/openssl_3.0.16-1~deb12u1_amd64.deb       '.trim(), '7db3b071c667eb81d9a7940f077c3325b0f89bbb696c8fa336e40f538058cedf' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/openssl_3.0.16-1~deb12u1_arm64.deb       '.trim(), '7b396d99f14f56ff5ac72cb646d30f36931f177d4845f5afa3483846c59b8f28' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/libssl3_3.0.16-1~deb12u1_amd64.deb       '.trim(), 'eaa2bab2130820f09361dc8186ddeb11d2a18ec5e5e3806f24414d5d8065a57a' ],
  [ 'https://ftp.debian.org/debian/pool/main/o/openssl/libssl3_3.0.16-1~deb12u1_arm64.deb       '.trim(), 'fbb2dae46eb5549723a59075aeb4bc33cb6d0c9d2f37b6c8617d4d61de02a2ef' ],
  // update at 2023/02/28, check: https://packages.debian.org/search?keywords=libjemalloc2
  [ 'https://ftp.debian.org/debian/pool/main/j/jemalloc/libjemalloc2_5.3.0-1_amd64.deb          '.trim(), 'a4117c23c5c8acf6c9678a6cb086f000b79476369da7efe8a78a70826956ad3d' ],
  [ 'https://ftp.debian.org/debian/pool/main/j/jemalloc/libjemalloc2_5.3.0-1_arm64.deb          '.trim(), '866eba7688ec5cbb98200a05540c4909df6320557371b634b5d394cd32b9f252' ]
]

const RES_NODE = [
  // update at 2025/06/03, check: https://nodejs.org/download/release/latest-v20.x/
  [ 'https://nodejs.org/download/release/latest-v20.x/node-v20.19.2-linux-x64.tar.gz  '.trim(), 'eec2c7b9c6ac72e42885a42edfc0503c0e4ee455f855c4a17a6cbcf026656dd5', 'node-@@@-amd64.tar.gz' ], // NOTE: fix filename
  [ 'https://nodejs.org/download/release/latest-v20.x/node-v20.19.2-linux-arm64.tar.gz'.trim(), '24c3090d4e8c3667cd57482263291ca4f562c2e0773d5e618a0c6ba32d21b39f', 'node-@@@-arm64.tar.gz' ], // NOTE: fix filename
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

// update at 2025/06/03, check version mapping at: https://github.com/puppeteer/puppeteer/blob/main/versions.json
const RES_BROWSER = [ // [ 'v24.10.0', { "chrome": "137.0.7151.55", "firefox": "stable_139.0.1" } ]
  [ 'https://security.debian.org/debian-security/pool/updates/main/c/chromium/chromium_137.0.7151.55-3~deb12u1_amd64.deb', 'cc49cc138b58dc47e658ab5699ebc54aaea67404e8b50d32969729e2df81cd74' ],
  [ 'https://security.debian.org/debian-security/pool/updates/main/c/chromium/chromium_137.0.7151.55-3~deb12u1_arm64.deb', '5e5f0a3e3c995d6595c651230972dd9c6256037953c6c09d90a82e3de8164cb5' ],
  [ 'https://security.debian.org/debian-security/pool/updates/main/c/chromium/chromium-common_137.0.7151.55-3~deb12u1_amd64.deb', 'dcacc5aa120930b77526fc89b41343ea7151ef3c8bdae3808d7596a12b80ede1' ],
  [ 'https://security.debian.org/debian-security/pool/updates/main/c/chromium/chromium-common_137.0.7151.55-3~deb12u1_arm64.deb', '36e784d78edd208854a5fd0d3a78289f578c0d5de84b37f8d650e25ea5464456' ],
  [ 'https://packages.mozilla.org/apt/pool/mozilla/firefox_139.0~build2_amd64_1a4fd07330b66887a34735fc97ea7917.deb', 'c6e643cb125dd214b44943ffba0c4c4d23ec0d48abda3c3e31f5140a8aa808aa' ],
  [ 'https://packages.mozilla.org/apt/pool/mozilla/firefox_139.0~build2_arm64_358a6a03c7e39ee63a9a8e4e6bcf6d90.deb', '2cad6a9e2e4dd5361a225b66ce1bc1f7b61fb8e54daebd35fc2527f5b8f72ad3' ]
]

module.exports = {
  RES_CORE_DEB12,

  RES_NODE,
  RES_NGINX,
  RES_GO,
  RES_F_BIT_DEB12,

  RES_RUBY3,

  PPTR_VER, PPTR_VER_ARM64_DEB12, RES_BROWSER
}
