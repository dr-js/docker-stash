const { strictEqual } = require('assert')

const { catchSync } = require('@dr-js/core/library/common/error')
const { oneOf } = require('@dr-js/core/library/common/verify')
const { calcHash } = require('@dr-js/core/library/node/data/Buffer')
const { modifyCopy } = require('@dr-js/core/library/node/file/Modify')
const { createDirectory } = require('@dr-js/core/library/node/file/Directory')

const { fetchWithJumpProxy } = require('@dr-js/node/library/module/Software/npm')

const { resetDirectory } = require('@dr-js/dev/library/node/file')
const { dockerSync } = require('@dr-js/dev/library/docker')
const { fromPathCombo } = require('@dr-js/dev/library/output')
const { runMain, resolve, readFileSync, writeFileSync } = require('@dr-js/dev/library/main')

const { fromRoot, fromOutput } = fromPathCombo()
const fromCache = (...args) => fromRoot('cache-gitignore/', ...args)

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
  const hashCacheBuffer = catchSync(readFileSync, fileCacheHash).result
  const isCacheValid = __DEV_SKIP_FETCH__ || (hashCacheBuffer && Buffer.compare(hashBuffer, hashCacheBuffer) === 0)
  if (isCacheValid) console.log(' - cache valid:', urlHash)
  else await resetDirectory(pathCache)
  const bufferList = []
  for (const url of urlList) {
    const fileCacheBuffer = resolve(pathCache, filenameFromUrl(url))
    let buffer = isCacheValid && catchSync(readFileSync, fileCacheBuffer).result // download buffer
    if (buffer) console.log(' - cache hit:', url)
    else {
      console.log(' - cache fetch as:', fileCacheBuffer)
      buffer = await fetchBuffer(url)
      writeFileSync(fileCacheBuffer, buffer)
    }
    bufferList.push(buffer)
  }
  !__DEV_SKIP_FETCH__ && writeFileSync(fileCacheHash, hashBuffer) // save cache hash last
  return bufferList
}

const fetchFileWithLocalCache = async (
  fetchList, // [ url, hash, pathOutput, filename = 'last part of url' ], will cache the url result, so url should contain some sort of hash
  pathCache
) => {
  await createDirectory(pathCache)
  for (const [ url, hash, pathOutput, filename = url.split('/').pop() ] of fetchList) {
    const fileCacheBuffer = resolve(pathCache, filenameFromUrl(url))
    let buffer = catchSync(readFileSync, fileCacheBuffer).result // download buffer
    if (buffer) console.log(' - cache hit:', url)
    else {
      console.log(' - cache fetch as:', fileCacheBuffer)
      buffer = await fetchBuffer(url)
      writeFileSync(fileCacheBuffer, buffer)
    }
    const [ hashString, hashAlgo = 'sha256', hashDigest = 'hex' ] = hash.split(':')
    strictEqual(calcHash(buffer, hashAlgo, hashDigest), hashString, `hash mismatch for: ${url}`)

    await createDirectory(pathOutput)
    writeFileSync(resolve(pathOutput, filename), buffer)
  }
}

const saveTagCore = (path, DOCKER_BUILD_MIRROR = '', tag) => writeFileSync(fromRoot(path, `TAG_CORE${DOCKER_BUILD_MIRROR}.json`), JSON.stringify(tag))
const loadTagCore = (path, DOCKER_BUILD_MIRROR = '') => JSON.parse(String(readFileSync(fromRoot(path, `TAG_CORE${DOCKER_BUILD_MIRROR}.json`))))
const loadRepo = (path, isGHCR = false) => JSON.parse(String(readFileSync(fromRoot(path, isGHCR ? 'BUILD_REPO_GHCR.json' : 'BUILD_REPO.json'))))

const [ semverMain, ...semverLabelList ] = PACKAGE_VERSION.split('-')
const [ tagVersionMajor ] = /^[.0]*\d*/.exec(semverMain) || [ 'unknown' ] // get semver major
const tagLabel = semverLabelList.join('').replace(/[^A-Za-z]/g, '') // separate `main` and `dev` caches
const TAG_LAYER_CACHE = [
  tagVersionMajor,
  tagLabel,
  'latest'
].filter(Boolean).join('-')

module.exports = {
  writeFileSync,
  oneOf, modifyCopy,
  runMain, resetDirectory, dockerSync,
  fromRoot, fromCache, fromOutput,
  fetchGitHubBufferListWithLocalCache, fetchFileWithLocalCache,
  saveTagCore, loadTagCore, loadRepo,
  TAG_LAYER_CACHE
}
