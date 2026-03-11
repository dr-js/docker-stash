const { resolve } = require('node:path')

const { existPathSync } = require('@dr-js/core/library/node/fs/Path.js')
const { createDirectory } = require('@dr-js/core/library/node/fs/Directory.js')
const { modifyCopySync } = require('@dr-js/core/library/node/fs/Modify.js')
const { runDockerSync } = require('@dr-js/core/library/node/module/Software/docker.js')

const { IMG_CHROMEDP } = require('./res-list.js')

// - why not use `chromium`:
//   `chrome-headless-shell` is smaller, faster, and need much less lib than `chromium`, check https://developer.chrome.com/blog/chrome-headless-shell
// - why not download from `storage.googleapis.com`:
//   the official build do not offer linux arm64 binary: https://github.com/GoogleChromeLabs/chrome-for-testing#json-api-endpoints
// - some linux arm64 provider:
//   - https://hub.docker.com/r/chromedp/headless-shell#about-headless-shell
//   - https://github.com/microsoft/playwright/blob/v1.58.2/packages/playwright-core/browsers.json
//   - https://github.com/remotion-dev/remotion/blob/v4.0.432/packages/renderer/src/browser/get-chrome-download-url.ts
// - why choose `chromedp/headless-shell`:
//   the version is updated faster

const prepareChromeHeadlessShellWithLocalCache = async ({ fileOutput, pathCache }) => {
  await createDirectory(pathCache)

  const imgPlatform = process.arch === 'arm64' ? 'linux/arm64' : 'linux/amd64'
  const fileCacheName = `${`${IMG_CHROMEDP}:${imgPlatform}`.replaceAll(/\W/g, '_')}.tar`
  const fileCachePath = resolve(pathCache, fileCacheName)
  if (!existPathSync(fileCachePath)) {
    console.log(' - pull docker image:', IMG_CHROMEDP, imgPlatform)
    runDockerSync([ 'image', 'pull', '--platform', imgPlatform, IMG_CHROMEDP ])
    runDockerSync([ 'image', 'tag', IMG_CHROMEDP, `${IMG_CHROMEDP}-${process.arch}` ])
    runDockerSync([ 'image', 'rm', IMG_CHROMEDP ])

    console.log(' - pack as tar from image:', fileCacheName)
    runDockerSync([ 'container', 'run', '--rm', `-v=${pathCache}:/mnt`, '--entrypoint=', `${IMG_CHROMEDP}-${process.arch}`,
      'tar', '--owner=0', '--group=0', '--numeric-owner', '--sort=name', '-cf', `/mnt/${fileCacheName}`, '-C', '/headless-shell/', '.'
    ])
  } else console.log(' - cache hit:', fileCacheName)

  await modifyCopySync(fileCachePath, fileOutput)
}

module.exports = {
  prepareChromeHeadlessShellWithLocalCache
}
