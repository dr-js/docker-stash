const { strictEqual } = require('assert')

const { catchAsync } = require('@dr-js/core/library/common/error.js')
const { calcHash } = require('@dr-js/core/library/node/data/Buffer.js')
const { readBuffer, writeBuffer, readJSON, writeJSON } = require('@dr-js/core/library/node/fs/File.js')
const { createDirectory, resetDirectory } = require('@dr-js/core/library/node/fs/Directory.js')
const { fetchWithJumpProxy } = require('@dr-js/core/library/node/module/Software/npm.js')

const { fromPathCombo } = require('@dr-js/dev/library/output.js')
const { runMain, resolve } = require('@dr-js/dev/library/main.js')

const { fromRoot, fromOutput, fromTemp } = fromPathCombo()

const { name: PACKAGE_NAME, version: PACKAGE_VERSION } = require(fromRoot('package.json'))

const fetchBuffer = async (url) => {
  console.log(' - fetch:', url)
  return (await fetchWithJumpProxy(url, {
    jumpMax: 4,
    timeout: 10 * 60 * 1000,
    headers: { 'accept': '*/*', 'user-agent': PACKAGE_NAME }
  })).buffer()
}

const filenameFromUrl = (url) => String(url).replace(/[^\w-]/g, '_')

const __DEV_SKIP_FETCH__ = false

const fetchGitHubBufferListWithLocalCache = async (
  urlList,
  urlHash, // use this fetch result as hash to decide cache valid or not
  pathCache
) => {
  const fileCacheHash = resolve(pathCache, filenameFromUrl(urlHash))
  const hashBuffer = __DEV_SKIP_FETCH__ ? undefined : await fetchBuffer(urlHash) // download hash
  const hashCacheBuffer = (await catchAsync(readBuffer, fileCacheHash)).result
  const isCacheValid = __DEV_SKIP_FETCH__ || (hashCacheBuffer && Buffer.compare(hashBuffer, hashCacheBuffer) === 0)
  if (isCacheValid) console.log(' - cache valid:', urlHash)
  else await resetDirectory(pathCache)
  const bufferList = []
  for (const url of urlList) {
    const fileCacheBuffer = resolve(pathCache, filenameFromUrl(url))
    let buffer = isCacheValid && (await catchAsync(readBuffer, fileCacheBuffer)).result // download buffer
    if (buffer) console.log(' - cache hit:', url)
    else {
      console.log(' - cache fetch as:', fileCacheBuffer)
      buffer = await fetchBuffer(url)
      await writeBuffer(fileCacheBuffer, buffer)
    }
    bufferList.push(buffer)
  }
  !__DEV_SKIP_FETCH__ && await writeBuffer(fileCacheHash, hashBuffer) // save cache hash last
  return bufferList
}

const fetchFileWithLocalCache = async (
  fetchList, // [ url, hash, pathOutput, filename = 'last part of url' ], will cache the url result, so url should contain some sort of hash
  pathCache
) => {
  await createDirectory(pathCache)
  for (const [ url, hash, pathOutput, filename = url.split('/').pop() ] of fetchList) {
    const fileCacheBuffer = resolve(pathCache, filenameFromUrl(url))
    let buffer = (await catchAsync(readBuffer, fileCacheBuffer)).result // download buffer
    if (buffer) console.log(' - cache hit:', url)
    else {
      console.log(' - cache fetch as:', fileCacheBuffer)
      buffer = await fetchBuffer(url)
      await writeBuffer(fileCacheBuffer, buffer)
    }
    const [ hashString, hashAlgo = 'sha256', hashDigest = 'hex' ] = hash.split(':')
    strictEqual(calcHash(buffer, hashAlgo, hashDigest), hashString, `hash mismatch for: ${url}`)

    await createDirectory(pathOutput)
    await writeBuffer(resolve(pathOutput, filename), buffer)
  }
}

const saveTagCore = async (path, DOCKER_BUILD_MIRROR = '', tag) => writeJSON(fromRoot(path, `TAG_CORE${DOCKER_BUILD_MIRROR}.json`), tag)
const loadTagCore = async (path, DOCKER_BUILD_MIRROR = '') => readJSON(fromRoot(path, `TAG_CORE${DOCKER_BUILD_MIRROR}.json`))
const loadRepo = async (path, isGHCR = false) => readJSON(fromRoot(path, isGHCR ? 'BUILD_REPO_GHCR.json' : 'BUILD_REPO.json'))

const [ semverMain, ...semverLabelList ] = PACKAGE_VERSION.split('-')
const [ tagVersionMajor ] = /^[.0]*\d*/.exec(semverMain) || [ 'unknown' ] // get semver major
const tagLabel = semverLabelList.join('').replace(/[^A-Za-z]/g, '') // separate `main` and `dev` caches
const TAG_LAYER_CACHE = [ tagVersionMajor, tagLabel, 'latest' ].filter(Boolean).join('-')
const TAG_LAYER_MAIN_CACHE = [ tagVersionMajor, 'latest' ].filter(Boolean).join('-') // try use main cache in `dev` branch

module.exports = {
  runMain, fromRoot, fromOutput, fromTemp,
  fetchGitHubBufferListWithLocalCache, fetchFileWithLocalCache,
  saveTagCore, loadTagCore, loadRepo,
  TAG_LAYER_CACHE, TAG_LAYER_MAIN_CACHE
}
