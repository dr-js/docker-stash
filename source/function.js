const { resolve, dirname } = require('path')
const { readFileSync, writeFileSync, createWriteStream } = require('fs')
const { createHash } = require('crypto')

const { catchSync } = require('@dr-js/core/library/common/error')
const { oneOf } = require('@dr-js/core/library/common/verify')
const { modifyCopy } = require('@dr-js/core/library/node/file/Modify')
const { createDirectory } = require('@dr-js/core/library/node/file/Directory')
const { run } = require('@dr-js/core/library/node/system/Run')
const { fetchWithJump } = require('@dr-js/core/library/node/net')

const { fetchLikeRequestWithProxy } = require('@dr-js/node/library/module/Software/npm')

const { runMain } = require('@dr-js/dev/library/main')
const { resetDirectory } = require('@dr-js/dev/library/node/file')

const PATH_ROOT = resolve(__dirname, '../')
const PATH_CACHE = resolve(__dirname, PATH_ROOT, 'cache-gitignore/')
const PATH_OUTPUT = resolve(__dirname, PATH_ROOT, 'output-gitignore/')
const fromRoot = (...args) => resolve(PATH_ROOT, ...args)
const fromCache = (...args) => resolve(PATH_CACHE, ...args)
const fromOutput = (...args) => resolve(PATH_OUTPUT, ...args)

const { name: PACKAGE_NAME } = require(fromRoot('package.json'))

const toRunDockerConfig = ({ argList = [], ...extra }) => (
  process.platform === 'win32'
    ? { ...extra, command: 'docker.exe', argList }
    : { ...extra, command: 'sudo', argList: [ 'docker', ...argList ] }
)

const runWithTee = async (logFile, { command, argList, option }) => { // output to both stdout and log file
  await createDirectory(dirname(logFile))
  const { promise, subProcess } = run({ command, argList, option: { stdio: [ 'ignore', 'pipe', 'pipe' ], ...option } })
  const logStream = createWriteStream(logFile)
  subProcess.stdout.pipe(process.stdout, { end: false })
  subProcess.stderr.pipe(process.stderr, { end: false })
  subProcess.stdout.pipe(logStream, { end: false })
  subProcess.stderr.pipe(logStream, { end: false })
  await promise
  subProcess.stdout.unpipe(process.stdout)
  subProcess.stderr.unpipe(process.stderr)
  subProcess.stdout.unpipe(logStream)
  subProcess.stderr.unpipe(logStream)
  logStream.end()
}

const fetchBuffer = async (url) => {
  console.log(' - fetch:', url)
  return (await fetchWithJump(url, {
    jumpMax: 4,
    timeout: 10 * 60 * 1000,
    headers: { 'accept': '*/*', 'user-agent': PACKAGE_NAME },
    fetch: fetchLikeRequestWithProxy
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

const fetchUrlWithLocalCache = async (
  urlList, // will cache the url result, so url should contain some sort of hash
  pathCache
) => {
  await createDirectory(pathCache)
  const bufferList = []
  for (const url of urlList) {
    const fileCacheBuffer = resolve(pathCache, filenameFromUrl(url))
    let buffer = catchSync(readFileSync, fileCacheBuffer).result // download buffer
    if (buffer) console.log(' - cache hit:', url)
    else {
      console.log(' - cache fetch as:', fileCacheBuffer)
      buffer = await fetchBuffer(url)
      writeFileSync(fileCacheBuffer, buffer)
    }
    bufferList.push(buffer)
  }
  return bufferList
}

const getIsDockerImageExist = async (imageRepo, imageTag) => {
  { // check local
    const { promise, stdoutPromise } = run(toRunDockerConfig({ argList: [ 'image', 'ls', `${imageRepo}:${imageTag}` ], quiet: true }))
    await promise
    const stdoutString = String(await stdoutPromise)
    if (stdoutString.includes(imageRepo) && stdoutString.includes(imageTag)) return true
  }
  try { // check pull
    const { promise } = run(toRunDockerConfig({ argList: [ 'pull', `${imageRepo}:${imageTag}` ] }))
    await promise
    { // check local again
      const { promise, stdoutPromise } = run(toRunDockerConfig({ argList: [ 'image', 'ls', `${imageRepo}:${imageTag}` ], quiet: true }))
      await promise
      const stdoutString = String(await stdoutPromise)
      if (stdoutString.includes(imageRepo) && stdoutString.includes(imageTag)) return true
    }
  } catch (error) {}
  return false
}

const saveTagCore = (path, DOCKER_BUILD_MIRROR = '', tag) => writeFileSync(fromRoot(path, `TAG_CORE${DOCKER_BUILD_MIRROR}.json`), JSON.stringify(tag))
const loadTagCore = (path, DOCKER_BUILD_MIRROR = '') => JSON.parse(String(readFileSync(fromRoot(path, `TAG_CORE${DOCKER_BUILD_MIRROR}.json`))))

module.exports = {
  writeFileSync, createHash,
  oneOf, modifyCopy,
  runMain, resetDirectory,
  fromRoot, fromCache, fromOutput,
  toRunDockerConfig, run, runWithTee,
  fetchGitHubBufferListWithLocalCache, fetchUrlWithLocalCache,
  getIsDockerImageExist, saveTagCore, loadTagCore
}
