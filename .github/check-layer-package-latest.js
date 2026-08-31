const { gunzipSync } = require('node:zlib')
const { runKit } = require('@dr-js/core/library/node/kit.js')
const { fetchWithJumpProxy } = require('@dr-js/core/library/node/module/Software/npm.js')
const { compareStringWithNumber } = require('@dr-js/core/library/common/compare.js')

const _fWJP = async (url, extHdr = {}) => fetchWithJumpProxy(url, {
  headers: { 'accept': '*/*', 'user-agent': 'docker-stash', ...extHdr }, // patch for sites require a UA, like GitHub
  jumpMax: 4, family: 4
})
const _wCA = (func, _cache = {}) => async (...argList) => { // withCacheAsync
  const cacheK = JSON.stringify(argList)
  let cacheV = _cache[ cacheK ]
  if (cacheV === undefined) cacheV = _cache[ cacheK ] = await func(...argList)
  return cacheV
}
const getText = _wCA(async (url, extHdr = {}) => (await _fWJP(url, extHdr)).text())
const getTextGz = _wCA(async (url, extHdr = {}) => gunzipSync(await (await _fWJP(url, extHdr)).buffer()).toString())

// Package: nodejs
// Version: 20.19.2-1nodesource1
// SHA256: d55d8091b4ca8eabdaaf8cf2f288ebe1e129fac528efaa51e56fae6ad1a846af
// Description: Node.js event-based server-side javascript engine
//  Node.js is similar in design to and influenced by systems like <-- starts with space
//  .. more desc ..
// .. more fields ..
const parseBinPkg = (text) => text.split('\n\n').map((v) => {
  const lineList = v.replaceAll('\n ', '\0').split('\n').filter(Boolean)
  if (!lineList.length) return
  const pkgObj = {}
  for (const line of lineList) {
    const [ key, ...valueList ] = line.split(': ')
    pkgObj[ key ] = valueList.join(': ').replaceAll('\0', '\n ')
  }
  return pkgObj
}).filter(Boolean)
const pickLatestPkg = (pkgList, pkgName = '') => pkgList
  .filter((v) => v[ 'Package' ] === pkgName) // filter out other pkg
  .sort((a, b) => -compareStringWithNumber(a[ 'Version' ], b[ 'Version' ]))[ 0 ] // get biggest version // https://www.debian.org/doc/debian-policy/ch-controlfields.html#version

// TODO: NOTE: to bypass bot-challenge page, need copy from browser on page like https://packages.debian.org/trixie/apt
const EXT_HDR_DEB = { cookie: 'pow_challenge=012..0d; pow_nonce=191; pow_bypass=0xa3..50' }
const getDebianDeb = async (dist = 'buster', pkg = '') => {
  const pkgDlList = [] // { pkgName, dlArch, dlUrl, dlSha256 }
  const textIndex = await getText(`https://packages.debian.org/${dist}/${pkg}`, EXT_HDR_DEB)
  // name     <h1>Package: ca-certificates (20211016)\n</h1>
  //          <h1>Package: libjemalloc2 (5.2.1-5)\n</h1>
  //          <h1>Package: chromium (118.0.5993.70-1~deb11u1 and others)\n [<strong class="pmarker" >security</strong>] </h1>
  // dl-url   <th><a href="/bookworm/all/ca-certificates/download">all</a></th>
  //          <th><a href="/bookworm/amd64/libjemalloc2/download">amd64</a></th>
  //          <th><a href="/bookworm/arm64/libjemalloc2/download">arm64</a></th>
  const pkgName = /<h1>Package:\s*(.+)\s*(?:\n.+)?<\/h1>/.exec(textIndex)[ 1 ]
  for (const dlArch of [
    textIndex.includes(`/${dist}/all/${pkg}/download`) && 'all',
    textIndex.includes(`/${dist}/amd64/${pkg}/download`) && 'amd64',
    textIndex.includes(`/${dist}/arm64/${pkg}/download`) && 'arm64'
  ].filter(Boolean)) {
    // https://packages.debian.org/bookworm/amd64/openssl/download
    const textDlPage = await getText(`https://packages.debian.org/${dist}/${dlArch}/${pkg}/download`, EXT_HDR_DEB)
    // <li><a href="http://ftp.debian.org/debian/pool/main/c/ca-certificates/ca-certificates_20211016_all.deb">ftp.debian.org/debian</a></li>
    // <tr><th>SHA256 checksum</th>\t<td><tt>d7abcfaa67bc16c4aed960c959ca62849102c8a0a61b9af9a23fcc870ebc3c57</tt></td>
    // <li><a href="http://ftp.debian.org/debian/pool/main/o/openssl/openssl_3.0.5-2_amd64.deb">ftp.debian.org/debian</a></li>
    // <tr><th>SHA256 checksum</th>\t<td><tt>d67bb6da8256863c85866059c8c2b93f1571ed7e2574b007241de35a2f0120d9</tt></td>
    // <ul><li><a href="http://security.debian.org/debian-security/pool/updates/main/c/chromium/chromium_118.0.5993.70-1~deb11u1_amd64.deb">security.debian.org/debian-security</a></li></ul>
    const dlUrl = 'https://' + /:\/\/((?:ftp|security)\.debian\.org\/debian(?:-security)?\/pool\/.*\.deb)">/.exec(textDlPage)[ 1 ]
    const dlSha256 = /SHA256 checksum<\/th>\s*<td><tt>(\w+)<\/tt>/.exec(textDlPage)[ 1 ]
    pkgDlList.push({ pkgName, dlArch, dlUrl, dlSha256 })
  }
  return pkgDlList
}

const getUbuntuDeb = async (dist = 'noble', pkg = '') => {
  const pkgDlList = [] // { pkgName, dlArch, dlUrl, dlSha256 }
  const textIndex = await getText(`https://packages.ubuntu.com/${dist}/${pkg}`)
  // name     <h1>Package: mysql-common (5.8+1.1.0build1)\n</h1>
  // name     <h1>Package: mysql-client-8.0 (8.0.45-0ubuntu0.24.04.1 and others)\n [<strong class="pmarker" >security</strong>] </h1>
  // dl-url   <th><a href="/noble/all/mysql-common/download">all</a></th>
  // dl-url   <th><a href="/noble/amd64/mysql-client-8.0/download">amd64</a></th> .. <td class='vcurrent'>8.0.45-0ubuntu0.24.04.1</td>
  //          <th><a href="/noble/arm64/mysql-client-8.0/download">arm64</a></th> .. <td class='vold'>8.0.36-2ubuntu3</td>
  const pkgName = /<h1>Package:\s*(.+)\s*(?:\n.+)?<\/h1>/.exec(textIndex)[ 1 ]
  for (const dlArch of [
    textIndex.includes(`/${dist}/all/${pkg}/download`) && 'all',
    textIndex.includes(`/${dist}/amd64/${pkg}/download`) && 'amd64',
    textIndex.includes(`/${dist}/arm64/${pkg}/download`) && 'arm64'
  ].filter(Boolean)) {
    // https://packages.ubuntu.com/noble/amd64/mysql-client-8.0/download
    const textDlPage = await getText(`https://packages.ubuntu.com/${dist}/${dlArch}/${pkg}/download`)
    // <p>You can download the requested file from the <tt>pool/main/m/mysql-8.0/</tt> subdirectory at:</p>
    // <p>You can download the requested file from the <tt>pool/main/m/mysql-8.0/</tt> subdirectory at any of these sites:</p>
    // <h3>More information on <kbd>mysql-client-core-8.0_8.0.36-2ubuntu3_arm64.deb</kbd>:</h3>
    // <tr><th>SHA256 checksum</th>\t<td><tt>0d1275c1004a55f7886bc23adefda950e5442be228799de8520776880dd84c82</tt></td>
    const uStub = /You can download the requested file from the <tt>(pool\/\S+)<\/tt> subdirectory at/.exec(textDlPage)[ 1 ]
    const uDeb = /More information on <kbd>(\S+\.deb)<\/kbd>:/.exec(textDlPage)[ 1 ]
    // TODO: need map from: https://kr.archive.ubuntu.com/ubuntu/pool/main/m/mysql-8.0/ (with amd64.deb & all.deb)
    //                  or:   https://security.ubuntu.com/ubuntu/pool/main/m/mysql-8.0/ (with amd64.deb & all.deb)
    //                  to:             https://ports.ubuntu.com/pool/main/m/mysql-8.0/ (with arm64.deb & all.deb)
    //       check: https://forum.odroid.com/viewtopic.php?t=32841
    const uPfx = dlArch === 'arm64' ? 'ports.ubuntu.com////////////'
      : textDlPage.includes('security.ubuntu.com') ? 'security.ubuntu.com/ubuntu//'
        : 'kr.archive.ubuntu.com/ubuntu'
    const dlUrl = `https://${uPfx}/${uStub}${uDeb}`
    const dlSha256 = /SHA256 checksum<\/th>\s*<td><tt>(\w+)<\/tt>/.exec(textDlPage)[ 1 ]
    pkgDlList.push({ pkgName, dlArch, dlUrl, dlSha256 })
  }
  return pkgDlList
}

const getFluentBitDeb = async (dist = 'buster', pkgName = 'fluent-bit') => {
  const pkgDlList = [] // { pkgName, dlArch, dlUrl, dlSha256 }
  for (const dlArch of [
    'amd64',
    'arm64'
  ]) {
    // https://packages.fluentbit.io/debian/bookworm/dists/bookworm/main/binary-amd64/Packages.gz
    const textDlPage = await getTextGz(`https://packages.fluentbit.io/debian/${dist}/dists/${dist}/main/binary-${dlArch}/Packages.gz`)
    const pkg = pickLatestPkg(parseBinPkg(textDlPage).filter((v) => v[ 'Version' ].startsWith('4.')), pkgName) // TODO: use v4 for now
    const dlUrl = `https://packages.fluentbit.io/debian/${dist}/` + pkg[ 'Filename' ]
    const dlSha256 = pkg[ 'SHA256' ]
    pkgDlList.push({ pkgName, dlArch, dlUrl, dlSha256 })
  }
  return pkgDlList
}

const getFirefoxDeb = async (pkgName = 'firefox') => {
  const pkgDlList = [] // { pkgName, dlArch, dlUrl, dlSha256 }
  for (const dlArch of [
    'amd64',
    'arm64'
  ]) {
    // https://packages.mozilla.org/apt/dists/mozilla/main/binary-amd64/Packages
    const textDlPage = await getText(`https://packages.mozilla.org/apt/dists/mozilla/main/binary-${dlArch}/Packages`)
    const pkg = pickLatestPkg(parseBinPkg(textDlPage), pkgName)
    const dlUrl = 'https://packages.mozilla.org/apt/' + pkg[ 'Filename' ]
    const dlSha256 = pkg[ 'SHA256' ]
    pkgDlList.push({ pkgName, dlArch, dlUrl, dlSha256 })
  }
  return pkgDlList
}

const getPg18Deb = async (dist = 'trixie', pkgName = 'postgresql-18') => { // https://www.postgresql.org/download/linux/debian/
  const pkgDlList = [] // { pkgName, dlArch, dlUrl, dlSha256 }
  for (const dlArch of [
    'amd64',
    'arm64'
  ]) {
    // https://ftp.postgresql.org/pub/repos/apt/dists/trixie-pgdg/main/binary-amd64/Packages.gz
    const textDlPage = await getTextGz(`https://ftp.postgresql.org/pub/repos/apt/dists/${dist}-pgdg/main/binary-${dlArch}/Packages.gz`)
    const pkg = pickLatestPkg(parseBinPkg(textDlPage), pkgName)
    const dlUrl = 'https://ftp.postgresql.org/pub/repos/apt/' + pkg[ 'Filename' ]
    const dlSha256 = pkg[ 'SHA256' ]
    if (dlUrl.endsWith('_all.deb')) pkgDlList.push({ pkgName, dlArch: 'all', dlUrl, dlSha256 })
    if (dlUrl.endsWith('_all.deb')) break
    pkgDlList.push({ pkgName, dlArch, dlUrl, dlSha256 })
  }
  return pkgDlList
}

const log = (pkgDlList) => {
  for (const { pkgName, dlArch, dlUrl, dlSha256 } of pkgDlList) {
    console.log(`  // <${dlArch}> ${pkgName}`)
    console.log(`  [ '${dlUrl}', '${dlSha256}' ],`)
  }
}

runKit(async (kit) => {
  kit.padLog('pkg-deb/trixie')
  log(await getDebianDeb('trixie', 'ca-certificates'))
  log(await getDebianDeb('trixie', 'openssl'))
  log(await getDebianDeb('trixie', 'libssl3t64'))
  log(await getDebianDeb('trixie', 'libjemalloc2'))

  kit.padLog('fluent-bit/trixie')
  log(await getFluentBitDeb('trixie'))

  // kit.padLog('browser:chromium')
  // log(await getDebianDeb('trixie', 'chromium'))
  // log(await getDebianDeb('trixie', 'chromium-common'))
  kit.padLog('browser:firefox')
  log(await getFirefoxDeb()) // NOTE: same deb for bullseye/bookworm/trixie

  kit.padLog('pg18/trixe')
  log(await getPg18Deb('trixie', 'libpq5'))
  log(await getPg18Deb('trixie', 'postgresql-client-common'))
  log(await getPg18Deb('trixie', 'postgresql-client-18'))
  log(await getPg18Deb('trixie', 'postgresql-common'))
  log(await getPg18Deb('trixie', 'postgresql-18'))

  kit.padLog('pkg-deb/noble')
  log(await getUbuntuDeb('noble-updates', 'mysql-client-core-8.0'))
  log(await getUbuntuDeb('noble-updates', 'libicu74')) // needed by `mysql-server-core-8.0` but debian/trixie use `libicu76`
  log(await getUbuntuDeb('noble-updates', 'mysql-server-core-8.0'))
}, { title: 'check-layer-package-latest' })
