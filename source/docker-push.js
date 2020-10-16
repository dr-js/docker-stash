const { runSync } = require('@dr-js/core/library/node/system/Run')
const { runMain } = require('@dr-js/dev/library/main')
const { fromRoot, toRunDockerConfig, loadTagCore } = require('./function')

runMain(async (logger) => {
  logger.padLog('push')

  const { version: BUILD_VERSION } = require(fromRoot('package.json'))
  const BUILD_REPO_DEBIAN10 = require('./debian10/BUILD_REPO.json')
  const BUILD_REPO_UBUNTU1804 = require('./ubuntu1804/BUILD_REPO.json')

  const tagList = [
    loadTagCore(fromRoot(__dirname, 'debian10/')),
    `${BUILD_REPO_DEBIAN10}:${BUILD_VERSION}-10-node`,
    `${BUILD_REPO_DEBIAN10}:${BUILD_VERSION}-10-bin`,
    `${BUILD_REPO_DEBIAN10}:${BUILD_VERSION}-10-full`,
    `${BUILD_REPO_DEBIAN10}:${BUILD_VERSION}-10-node-cn`,
    `${BUILD_REPO_DEBIAN10}:${BUILD_VERSION}-10-bin-cn`,
    `${BUILD_REPO_DEBIAN10}:${BUILD_VERSION}-10-full-cn`,

    loadTagCore(fromRoot(__dirname, 'ubuntu1804/')),
    `${BUILD_REPO_UBUNTU1804}:${BUILD_VERSION}-1804-node`,
    `${BUILD_REPO_UBUNTU1804}:${BUILD_VERSION}-1804-bin`,
    `${BUILD_REPO_UBUNTU1804}:${BUILD_VERSION}-1804-full`,
    `${BUILD_REPO_UBUNTU1804}:${BUILD_VERSION}-1804-node-cn`,
    `${BUILD_REPO_UBUNTU1804}:${BUILD_VERSION}-1804-bin-cn`,
    `${BUILD_REPO_UBUNTU1804}:${BUILD_VERSION}-1804-full-cn`
  ]

  for (const tag of tagList) {
    logger.log(`push tag: ${tag}`)
    runSync(toRunDockerConfig({ argList: [ 'push', tag ] }))
  }
}, 'docker-push')
