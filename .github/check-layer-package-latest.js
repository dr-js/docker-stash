const { runKit } = require('@dr-js/core/library/node/kit.js')
const { fetchWithJump } = require('@dr-js/core/library/node/net.js')

const getText = async (url) => (await fetchWithJump(url, {
  headers: { 'accept': '*/*', 'user-agent': 'docker-stash' }, // patch for sites require a UA, like GitHub
  jumpMax: 4
})).text()
const getDebianDeb = async (dist = 'buster', pkg = '') => {
  const pkgDlList = [] // { pkgName, dlArch, dlUrl, dlSha256 }
  const textIndex = await getText(`https://packages.debian.org/${dist}/${pkg}`)
  // name     <h1>Package: ca-certificates (20211016)\n</h1>
  // dl-url   <th><a href="/bookworm/all/ca-certificates/download">all</a></th>
  // name     <h1>Package: libjemalloc2 (5.2.1-5)\n</h1>
  // dl-url   <th><a href="/bookworm/amd64/libjemalloc2/download">amd64</a></th>
  //          <th><a href="/bookworm/arm64/libjemalloc2/download">arm64</a></th>
  const pkgName = /<h1>Package:\s*(.+)\s*<\/h1>/.exec(textIndex)[ 1 ]
  for (const dlArch of [
    textIndex.includes(`/${dist}/all/${pkg}/download`) && 'all',
    textIndex.includes(`/${dist}/amd64/${pkg}/download`) && 'amd64',
    textIndex.includes(`/${dist}/arm64/${pkg}/download`) && 'arm64'
  ].filter(Boolean)) {
    const textDlPage = await getText(`https://packages.debian.org/${dist}/${dlArch}/${pkg}/download`)
    // <li><a href="http://ftp.debian.org/debian/pool/main/c/ca-certificates/ca-certificates_20211016_all.deb">ftp.debian.org/debian</a></li>
    // <tr><th>SHA256 checksum</th>\t<td><tt>d7abcfaa67bc16c4aed960c959ca62849102c8a0a61b9af9a23fcc870ebc3c57</tt></td>
    // <li><a href="http://ftp.debian.org/debian/pool/main/o/openssl/openssl_3.0.5-2_amd64.deb">ftp.debian.org/debian</a></li>
    // <tr><th>SHA256 checksum</th>\t<td><tt>d67bb6da8256863c85866059c8c2b93f1571ed7e2574b007241de35a2f0120d9</tt></td>
    const dlUrl = /:\/\/(ftp\.debian\.org\/debian\/pool\/.*\.deb)">/.exec(textDlPage)[ 1 ]
    const dlSha256 = /SHA256 checksum<\/th>\s*<td><tt>(\w+)<\/tt>/.exec(textDlPage)[ 1 ]
    pkgDlList.push({ pkgName, dlArch, dlUrl, dlSha256 })
  }
  return pkgDlList
}

runKit(async (kit) => {
  // kit.padLog('debian11/bullseye')
  // console.log(await getDebianDeb('bullseye', 'ca-certificates'))
  // console.log(await getDebianDeb('bullseye', 'openssl'))
  // console.log(await getDebianDeb('bullseye', 'libssl1.1'))
  // console.log(await getDebianDeb('bullseye', 'libjemalloc2'))
  // console.log(await getDebianDeb('bullseye', 'chromium'))

  kit.padLog('debian12/bookworm')
  console.log(await getDebianDeb('bookworm', 'ca-certificates'))
  console.log(await getDebianDeb('bookworm', 'openssl'))
  console.log(await getDebianDeb('bookworm', 'libssl3'))
  console.log(await getDebianDeb('bookworm', 'libjemalloc2'))
  console.log(await getDebianDeb('bookworm', 'chromium'))
}, { title: 'ci-patch' })
