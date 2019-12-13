const { resolve, dirname } = require('path')

const { readFileAsync, writeFileAsync, createWriteStream } = require('@dr-js/core/library/node/file/function')
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

const COMMAND_DOCKER = process.platform === 'win32' ? 'docker' : 'sudo docker'

const runWithTee = async (logFile, { command, argList, option }) => { // output to both stdout and log file
  await createDirectory(dirname(logFile))
  const { promise, subProcess } = run({ command, argList, option: { stdio: [ "ignore", "pipe", "pipe" ], ...option } })
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
  const hashCacheBuffer = await readFileAsync(fileCacheHash).catch(() => null)
  const isCacheValid = hashCacheBuffer && Buffer.compare(hashBuffer, hashCacheBuffer) === 0
  if (isCacheValid) console.log(' - cache valid:', urlHash)
  else await resetDirectory(pathCache)
  const bufferList = []
  for (const url of urlList) {
    const fileCacheBuffer = resolve(pathCache, filenameFromUrl(url))
    let buffer = isCacheValid && await readFileAsync(fileCacheBuffer).catch(() => null) // download buffer
    if (buffer) console.log(' - cache hit:', url)
    else {
      buffer = await fetchGitHubBuffer(url)
      await writeFileAsync(fileCacheBuffer, buffer)
    }
    bufferList.push(buffer)
  }
  await writeFileAsync(fileCacheHash, hashBuffer) // save cache hash last
  return bufferList
}

const getIsDockerImageExist = async (imageRepo, imageTag) => {
  { // check local
    const { promise, stdoutPromise } = run({ command: COMMAND_DOCKER, argList: [ 'image', 'ls', `${imageRepo}:${imageTag}` ], quiet: true })
    await promise
    const stdoutString = String(await stdoutPromise)
    if (stdoutString.includes(imageRepo) && stdoutString.includes(imageTag)) return true
  }
  try { // check pull
    const { promise } = run({ command: COMMAND_DOCKER, argList: [ 'pull', `${imageRepo}:${imageTag}` ] })
    await promise
    { // check local again
      const { promise, stdoutPromise } = run({ command: COMMAND_DOCKER, argList: [ 'image', 'ls', `${imageRepo}:${imageTag}` ], quiet: true })
      await promise
      const stdoutString = String(await stdoutPromise)
      if (stdoutString.includes(imageRepo) && stdoutString.includes(imageTag)) return true
    }
  } catch (error) {}
  return false
}

const saveTagCoreAsync = (path, tag) => writeFileAsync(fromRoot(path, 'TAG_CORE.json'), JSON.stringify(tag))
const loadTagCoreAsync = (path) => readFileAsync(fromRoot(path, 'TAG_CORE.json')).then((buffer) => JSON.parse(String(buffer)))

module.exports = {
  resetDirectory,
  fromRoot, fromCache, fromOutput,
  COMMAND_DOCKER, runWithTee,
  fetchGitHubBufferListWithLocalCache,
  getIsDockerImageExist, saveTagCoreAsync, loadTagCoreAsync
}