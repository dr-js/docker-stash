const { resolve } = require('path')

const { catchAsync } = require('@dr-js/core/library/common/error.js')
const { strictEqual, oneOf } = require('@dr-js/core/library/common/verify.js')
const { calcHash } = require('@dr-js/core/library/node/data/Buffer.js')
const { readBuffer, writeBuffer, readJSONSync, writeJSONSync } = require('@dr-js/core/library/node/fs/File.js')
const { createDirectory, resetDirectory } = require('@dr-js/core/library/node/fs/Directory.js')
const { fetchWithJumpProxy } = require('@dr-js/core/library/node/module/Software/npm.js')

const { name: PACKAGE_NAME, version: PACKAGE_VERSION } = require('../package.json')

const BUILDKIT_SYNTAX = 'docker/dockerfile:1.3.0'
const DOCKER_BUILD_ARCH_INFO_LIST = [
  { key: 'amd64', node: 'x64', docker: 'linux/amd64', debian: 'amd64', debianLibName: 'x86_64-linux-gnu' },
  { key: 'arm64', node: 'arm64', docker: 'linux/arm64', debian: 'arm64', debianLibName: 'aarch64-linux-gnu' }
]

const DEBIAN11_BUILD_REPO = require('./debian11/BUILD_REPO.json')
const DEBIAN11_BUILD_REPO_GHCR = require('./debian11/BUILD_REPO_GHCR.json')
const DEBIAN11_BUILD_FLAVOR_MAP = require('./debian11/BUILD_FLAVOR_MAP.json')
const DEBIAN11_BUILD_FLAVOR_LIST = Object.values(DEBIAN11_BUILD_FLAVOR_MAP)

const saveDebian11TagCore = (DOCKER_BUILD_MIRROR = '', tag) => writeJSONSync(resolve(__dirname, `debian11/TAG_CORE${DOCKER_BUILD_MIRROR}.json`), tag)
const loadDebian11TagCore = (DOCKER_BUILD_MIRROR = '') => readJSONSync(resolve(__dirname, `debian11/TAG_CORE${DOCKER_BUILD_MIRROR}.json`))
const verifyDebian11BuildArg = ({ BUILD_FLAVOR_NAME, DOCKER_BUILD_MIRROR }) => {
  oneOf(BUILD_FLAVOR_NAME, DEBIAN11_BUILD_FLAVOR_LIST.map(({ NAME }) => NAME))
  oneOf(DOCKER_BUILD_MIRROR, [ '', 'CN' ])
  const BUILD_FLAVOR = DEBIAN11_BUILD_FLAVOR_LIST.find(({ NAME }) => BUILD_FLAVOR_NAME === NAME)
  const getFlavoredTag = (name, version = PACKAGE_VERSION) => `11-${name}-${version}${DOCKER_BUILD_MIRROR && `-${DOCKER_BUILD_MIRROR.toLowerCase()}`}`
  const getFlavoredImageTag = (name, version = PACKAGE_VERSION) => name === '@CORE'
    ? loadDebian11TagCore(DOCKER_BUILD_MIRROR)
    : `${DEBIAN11_BUILD_REPO}:${getFlavoredTag(name, version)}`
  return {
    BUILD_FLAVOR,
    getFlavoredTag, getFlavoredImageTag
  }
}

const fetchBuffer = async (url) => {
  console.log(' - fetch:', url)
  return (await fetchWithJumpProxy(url, {
    jumpMax: 4,
    timeout: 10 * 60 * 1000,
    headers: { 'accept': '*/*', 'user-agent': PACKAGE_NAME }
  })).buffer()
}

const filenameFromUrl = (url) => String(url).replace(/[^\w-]/g, '_')

const __DEV_SKIP_FETCH__ = false // NOTE: debug fast toggle

const fetchGitHubBufferMapWithLocalCache = async (
  urlMap,
  urlCacheHash, // use this fetch result as hash to decide cache valid or not
  pathCache
) => {
  const fileCacheHash = resolve(pathCache, filenameFromUrl(urlCacheHash))
  const hashBuffer = __DEV_SKIP_FETCH__ ? undefined : await fetchBuffer(urlCacheHash) // download hash
  const hashCacheBuffer = (await catchAsync(readBuffer, fileCacheHash)).result
  const isCacheValid = __DEV_SKIP_FETCH__ || (hashCacheBuffer && Buffer.compare(hashBuffer, hashCacheBuffer) === 0)
  if (isCacheValid) console.log(' - cache valid:', urlCacheHash)
  else await resetDirectory(pathCache)
  const bufferMap = {}
  for (const [ key, url ] of Object.entries(urlMap)) {
    const fileCacheBuffer = resolve(pathCache, filenameFromUrl(url))
    let buffer = isCacheValid && (await catchAsync(readBuffer, fileCacheBuffer)).result // download buffer
    if (buffer) console.log(' - cache hit:', url)
    else {
      console.log(' - cache fetch as:', fileCacheBuffer)
      buffer = await fetchBuffer(url)
      await writeBuffer(fileCacheBuffer, buffer)
    }
    bufferMap[ key ] = buffer
  }
  !__DEV_SKIP_FETCH__ && await writeBuffer(fileCacheHash, hashBuffer) // save cache hash last
  return bufferMap
}

const fetchFileListWithLocalCache = async (
  fetchList = [], // [ url, hash, filename = 'last part of url' ], will cache the url result, so url should contain some sort of hash
  { pathOutput, pathCache }
) => {
  await createDirectory(pathCache)
  for (const [ url, hash, filename = url.split('/').pop() ] of fetchList) {
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

const [ semverMain, ...semverLabelList ] = PACKAGE_VERSION.split('-')
const [ tagVersionMajor ] = /^[.0]*\d*/.exec(semverMain) || [ 'unknown' ] // get semver major
const tagLabel = semverLabelList.join('').replace(/[^A-Za-z]/g, '') // separate `main` and `dev` caches
const TAG_LAYER_CACHE = [ tagVersionMajor, tagLabel, 'latest' ].filter(Boolean).join('-')
const TAG_LAYER_MAIN_CACHE = [ tagVersionMajor, 'latest' ].filter(Boolean).join('-') // try use main cache in `dev` branch

module.exports = {
  BUILDKIT_SYNTAX, DOCKER_BUILD_ARCH_INFO_LIST,

  DEBIAN11_BUILD_REPO, DEBIAN11_BUILD_REPO_GHCR,
  DEBIAN11_BUILD_FLAVOR_MAP, DEBIAN11_BUILD_FLAVOR_LIST,
  saveDebian11TagCore, loadDebian11TagCore, verifyDebian11BuildArg,

  fetchGitHubBufferMapWithLocalCache, fetchFileListWithLocalCache,
  TAG_LAYER_CACHE, TAG_LAYER_MAIN_CACHE
}
