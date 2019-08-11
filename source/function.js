const { resolve, dirname } = require('path')

const { readFileAsync, writeFileAsync, createWriteStream } = require('dr-js/library/node/file/function')
const { createDirectory } = require('dr-js/library/node/file/File')
const { modify } = require('dr-js/library/node/file/Modify')
const { run } = require('dr-js/library/node/system/Run')
const { fetchWithJump } = require('dr-js/bin/function')

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
  return (await fetchWithJump(
    url,
    { headers: { 'accept': '*/*', 'user-agent': PACKAGE_NAME }, timeout: 10 * 60 * 1000 },
    8
  )).buffer()
}

const filenameFromUrl = (url) => String(url).replace(/[^\w-]/g, '_')

const fetchGitHubBufferListWithLocalCache = async (urlList, urlHash, pathCache) => {
  const fileCacheHash = resolve(pathCache, filenameFromUrl(urlHash))
  const hashBuffer = await fetchGitHubBuffer(urlHash) // download hash
  const hashCacheBuffer = await readFileAsync(fileCacheHash).catch(() => null)
  const isCacheValid = hashCacheBuffer && Buffer.compare(hashBuffer, hashCacheBuffer) === 0
  if (isCacheValid) console.log(' - cache valid:', urlHash)
  else {
    await modify.delete(pathCache).catch(() => {})
    await createDirectory(pathCache)
  }
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

module.exports = {
  fromRoot, fromCache, fromOutput,
  COMMAND_DOCKER, runWithTee,
  fetchGitHubBufferListWithLocalCache
}