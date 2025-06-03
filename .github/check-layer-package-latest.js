const { runKit } = require('@dr-js/core/library/node/kit.js')
const { fetchWithJumpProxy } = require('@dr-js/core/library/node/module/Software/npm.js')
const { compareStringWithNumber } = require('@dr-js/core/library/common/compare.js')

const getText = async (url) => (await fetchWithJumpProxy(url, {
  headers: { 'accept': '*/*', 'user-agent': 'docker-stash' }, // patch for sites require a UA, like GitHub
  jumpMax: 4, family: 4
})).text()

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

const getDebianDeb = async (dist = 'buster', pkg = '') => {
  const pkgDlList = [] // { pkgName, dlArch, dlUrl, dlSha256 }
  const textIndex = await getText(`https://packages.debian.org/${dist}/${pkg}`)
  // name     <h1>Package: ca-certificates (20211016)\n</h1>
  // dl-url   <th><a href="/bookworm/all/ca-certificates/download">all</a></th>
  // name     <h1>Package: libjemalloc2 (5.2.1-5)\n</h1>
  // dl-url   <th><a href="/bookworm/amd64/libjemalloc2/download">amd64</a></th>
  //          <th><a href="/bookworm/arm64/libjemalloc2/download">arm64</a></th>
  // name     <h1>Package: chromium (118.0.5993.70-1~deb11u1 and others)
  //            [<strong class="pmarker" >security</strong>] </h1>
  const pkgName = /<h1>Package:\s*(.+)\s*(?:\n.+)?<\/h1>/.exec(textIndex)[ 1 ]
  for (const dlArch of [
    textIndex.includes(`/${dist}/all/${pkg}/download`) && 'all',
    textIndex.includes(`/${dist}/amd64/${pkg}/download`) && 'amd64',
    textIndex.includes(`/${dist}/arm64/${pkg}/download`) && 'arm64'
  ].filter(Boolean)) {
    // https://packages.debian.org/bookworm/amd64/openssl/download
    const textDlPage = await getText(`https://packages.debian.org/${dist}/${dlArch}/${pkg}/download`)
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

// const getNodesourceDeb = async (dist = 'nodistro', rel = '20', pkgName = 'nodejs') => {
//   const pkgDlList = [] // { pkgName, dlArch, dlUrl, dlSha256 }
//   for (const dlArch of [
//     'amd64',
//     'arm64'
//   ]) {
//     // https://deb.nodesource.com/node_20.x/dists/nodistro/main/binary-amd64/Packages
//     const textDlPage = await getText(`https://deb.nodesource.com/node_${rel}.x/dists/${dist}/main/binary-${dlArch}/Packages`)
//     const pkg = pickLatestPkg(parseBinPkg(textDlPage), pkgName)
//     const dlUrl = `https://deb.nodesource.com/node_${rel}.x/` + pkg[ 'Filename' ]
//     const dlSha256 = pkg[ 'SHA256' ]
//     pkgDlList.push({ pkgName, dlArch, dlUrl, dlSha256 })
//   }
//   return pkgDlList
// }

const getFluentBitDeb = async (dist = 'buster', pkgName = 'fluent-bit') => {
  const pkgDlList = [] // { pkgName, dlArch, dlUrl, dlSha256 }
  for (const dlArch of [
    'amd64',
    'arm64'
  ]) {
    // https://packages.fluentbit.io/debian/bookworm/dists/bookworm/main/binary-amd64/Packages
    const textDlPage = await getText(`https://packages.fluentbit.io/debian/${dist}/dists/${dist}/main/binary-${dlArch}/Packages`)
    const pkg = pickLatestPkg(parseBinPkg(textDlPage), pkgName)
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

const log = (pkgDlList) => {
  for (const { pkgName, dlArch, dlUrl, dlSha256 } of pkgDlList) {
    console.log(`  // <${dlArch}> ${pkgName}`)
    console.log(`  [ '${dlUrl}', '${dlSha256}' ]`)
  }
}

runKit(async (kit) => {
  kit.padLog('debian12/bookworm')
  log(await getDebianDeb('bookworm', 'ca-certificates'))
  log(await getDebianDeb('bookworm', 'openssl'))
  log(await getDebianDeb('bookworm', 'libssl3'))
  log(await getDebianDeb('bookworm', 'libjemalloc2'))
  log(await getDebianDeb('bookworm', 'chromium'))

  // kit.padLog('nodesource/nodistro')
  // log(await getNodesourceDeb()) // NOTE: same deb for bullseye/bookworm

  kit.padLog('fluent-bit/bookworm')
  log(await getFluentBitDeb('bookworm'))

  kit.padLog('firefox')
  log(await getFirefoxDeb()) // NOTE: same deb for bullseye/bookworm
}, { title: 'ci-patch' })
