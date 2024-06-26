const { runKit } = require('@dr-js/core/library/node/kit.js')
const { fetchWithJumpProxy } = require('@dr-js/core/library/node/module/Software/npm.js')

const getText = async (url) => (await fetchWithJumpProxy(url, {
  headers: { 'accept': '*/*', 'user-agent': 'docker-stash' }, // patch for sites require a UA, like GitHub
  jumpMax: 4, family: 4
})).text()

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

const getNodesourceDeb = async (dist = 'buster', rel = '20') => {
  const pkgDlList = [] // { pkgName, dlArch, dlUrl, dlSha256 }
  for (const dlArch of [
    'amd64',
    'arm64'
  ]) {
    // https://deb.nodesource.com/node_20.x/dists/nodistro/main/binary-amd64/Packages
    const textDlPage = await getText(`https://deb.nodesource.com/node_${rel}.x/dists/${dist}/main/binary-${dlArch}/Packages`)
    const textDlPkg0 = textDlPage.split('\n\n')[ 0 ] // pick first package
    // Filename: pool/main/n/nodejs/nodejs_20.15.0-1nodesource1_amd64.deb
    // SHA256: 9fd6bc3754cfc5960ce9c08640dbefa4093c274cff4f15065f754849f275c5b8
    const dlUrl = `https://deb.nodesource.com/node_${rel}.x/` + /Filename: (pool\/main\/n\/nodejs\/nodejs_[.\d]+-[-\w]+_a(rm|md)64\.deb)/.exec(textDlPkg0)[ 1 ]
    const dlSha256 = /SHA256: (\w+)/.exec(textDlPage)[ 1 ]
    pkgDlList.push({ pkgName: 'nodejs', dlArch, dlUrl, dlSha256 })
  }
  return pkgDlList
}

const getFluentBitDeb = async (dist = 'buster') => {
  const pkgDlList = [] // { pkgName, dlArch, dlUrl, dlSha256 }
  for (const dlArch of [
    'amd64',
    'arm64'
  ]) {
    // https://packages.fluentbit.io/debian/bookworm/dists/bookworm/main/binary-amd64/Packages
    const textDlPage = await getText(`https://packages.fluentbit.io/debian/${dist}/dists/${dist}/main/binary-${dlArch}/Packages`)
    const textDlPkg0 = textDlPage.split('\n\n')[ 0 ] // pick first package
    // Filename: pool/main/f/fluent-bit/fluent-bit_3.0.7_amd64.deb
    // SHA256: 7284302d281e8b91fe17e00552fa8d794d0cc05ebaf976171e5e57316893be66
    const dlUrl = `https://packages.fluentbit.io/debian/${dist}/` + /Filename: (pool\/main\/f\/fluent-bit\/fluent-bit_[.\d]+_a(rm|md)64\.deb)/.exec(textDlPkg0)[ 1 ]
    const dlSha256 = /SHA256: (\w+)/.exec(textDlPage)[ 1 ]
    pkgDlList.push({ pkgName: 'fluent-bit', dlArch, dlUrl, dlSha256 })
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
  kit.padLog('debian11/bullseye')
  log(await getDebianDeb('bullseye', 'ca-certificates')) // NOTE: skip, not change so often
  log(await getDebianDeb('bullseye', 'openssl')) // NOTE: skip, not change so often
  log(await getDebianDeb('bullseye', 'libssl1.1')) // NOTE: skip, not change so often
  log(await getDebianDeb('bullseye', 'libjemalloc2')) // NOTE: skip, not change so often
  log(await getDebianDeb('bullseye', 'chromium'))

  kit.padLog('debian12/bookworm')
  log(await getDebianDeb('bookworm', 'ca-certificates'))
  log(await getDebianDeb('bookworm', 'openssl'))
  log(await getDebianDeb('bookworm', 'libssl3'))
  log(await getDebianDeb('bookworm', 'libjemalloc2'))
  log(await getDebianDeb('bookworm', 'chromium'))

  // NOTE: same deb for bullseye/bookworm
  kit.padLog('nodesource/nodistro')
  log(await getNodesourceDeb('nodistro'))

  kit.padLog('fluent-bit/bullseye')
  log(await getFluentBitDeb('bullseye'))
  kit.padLog('fluent-bit/bookworm')
  log(await getFluentBitDeb('bookworm'))
}, { title: 'ci-patch' })
