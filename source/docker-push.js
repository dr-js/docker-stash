const { runSync } = require('@dr-js/core/library/node/system/Run')
const { runMain } = require('@dr-js/dev/library/main')
const { fromRoot, COMMAND_DOCKER, loadTagCoreAsync } = require('./function')

runMain(async (logger) => {
  logger.padLog('push')

  const { version: BUILD_VERSION } = require(fromRoot('package.json'))
  const BUILD_REPO = require('./ubuntu1804/BUILD_REPO.json')

  const tagList = [
    await loadTagCoreAsync(fromRoot(__dirname, 'ubuntu1804/')),
    `${BUILD_REPO}:${BUILD_VERSION}-1804-node`,
    `${BUILD_REPO}:${BUILD_VERSION}-1804-bin`,
    `${BUILD_REPO}:${BUILD_VERSION}-1804-full`,
    `${BUILD_REPO}:${BUILD_VERSION}-1804-node-cn`,
    `${BUILD_REPO}:${BUILD_VERSION}-1804-bin-cn`,
    `${BUILD_REPO}:${BUILD_VERSION}-1804-full-cn`
  ]

  for (const tag of tagList) {
    logger.log(`push tag: ${tag}`)
    runSync({ command: COMMAND_DOCKER, argList: [ 'push', tag ] })
  }
}, 'docker-push')
