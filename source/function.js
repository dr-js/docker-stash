const { resolve, dirname } = require('path')
const { readFileSync, writeFileSync, createWriteStream } = require('fs')

const { catchSync } = require('@dr-js/core/library/common/error')
const { createDirectory } = require('@dr-js/core/library/node/file/Directory')
const { run } = require('@dr-js/core/library/node/system/Run')
const { resetDirectory } = require('@dr-js/dev/library/node/file')

const { fetchWithJump } = require('@dr-js/core/library/node/net')

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

const fetchGitHubBuffer = async (url) => {
  console.log(' - fetch:', url)
  return (await fetchWithJump(url, {
    jumpMax: 8,
    timeout: 10 * 60 * 1000,
    headers: { 'accept': '*/*', 'user-agent': PACKAGE_NAME }
  })).buffer()
}

const filenameFromUrl = (url) => String(url).replace(/[^\w-]/g, '_')

const fetchGitHubBufferListWithLocalCache = async (urlList, urlHash, pathCache) => {
  const fileCacheHash = resolve(pathCache, filenameFromUrl(urlHash))
  const hashBuffer = await fetchGitHubBuffer(urlHash) // download hash
  const hashCacheBuffer = catchSync(readFileSync, fileCacheHash).result
  const isCacheValid = hashCacheBuffer && Buffer.compare(hashBuffer, hashCacheBuffer) === 0
  if (isCacheValid) console.log(' - cache valid:', urlHash)
  else await resetDirectory(pathCache)
  const bufferList = []
  for (const url of urlList) {
    const fileCacheBuffer = resolve(pathCache, filenameFromUrl(url))
    let buffer = isCacheValid && catchSync(readFileSync, fileCacheBuffer).result // download buffer
    if (buffer) console.log(' - cache hit:', url)
    else {
      buffer = await fetchGitHubBuffer(url)
      writeFileSync(fileCacheBuffer, buffer)
    }
    bufferList.push(buffer)
  }
  writeFileSync(fileCacheHash, hashBuffer) // save cache hash last
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

const saveTagCore = (path, tag) => writeFileSync(fromRoot(path, 'TAG_CORE.json'), JSON.stringify(tag))
const loadTagCore = (path) => JSON.parse(String(readFileSync(fromRoot(path, 'TAG_CORE.json'))))

module.exports = {
  resetDirectory,
  fromRoot, fromCache, fromOutput,
  toRunDockerConfig, runWithTee,
  fetchGitHubBufferListWithLocalCache,
  getIsDockerImageExist, saveTagCore, loadTagCore
}
