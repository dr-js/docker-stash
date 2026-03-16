const BUILD_FLAVOR_MAP = {
  'F_BIN_CMMN': { 'NAME': 'bin-common', 'BASE_IMAGE': '@CORE', 'LAYER_SCRIPT': '2-0-bin-common.sh' },
  'F_BIN_NODE': { 'NAME': 'bin-node', 'BASE_IMAGE': 'bin-common', 'LAYER_SCRIPT': '2-2-bin-node.sh' },
  'F_BIN_SSHD': { 'NAME': 'bin-sshd', 'BASE_IMAGE': 'bin-node', 'LAYER_SCRIPT': '2-4-bin-sshd.sh' },
  'F_BIN_ETC_': { 'NAME': 'bin-etc', 'BASE_IMAGE': 'bin-sshd', 'LAYER_SCRIPT': '2-6-bin-etc.sh' },

  'F_BIN_GIT_': { 'NAME': 'bin-git', 'BASE_IMAGE': 'bin-etc', 'LAYER_SCRIPT': '4-0-bin-git.sh' },
  'F_BIN_RBY3': { 'NAME': 'bin-ruby3', 'BASE_IMAGE': 'bin-git', 'LAYER_SCRIPT': '4-2-bin-ruby3.sh' },
  'F_BIN_JAVA': { 'NAME': 'bin-java', 'BASE_IMAGE': 'bin-ruby3', 'LAYER_SCRIPT': '4-4-bin-java.sh' },
  'F_BIN_VIPS': { 'NAME': 'bin-vips', 'BASE_IMAGE': 'bin-java', 'LAYER_SCRIPT': '4-5-bin-vips.sh' },
  'F_BIN_GO__': { 'NAME': 'bin-go', 'BASE_IMAGE': 'bin-vips', 'LAYER_SCRIPT': '4-6-bin-go.sh' },
  'F_BIN_BULD': { 'NAME': 'bin-build', 'BASE_IMAGE': 'bin-go', 'LAYER_SCRIPT': '4-8-bin-build.sh' },

  'F_BIN_NGNX': { 'NAME': 'bin-nginx', 'BASE_IMAGE': 'bin-vips', 'LAYER_SCRIPT': '6-0-bin-nginx.2-check.sh',
    'BUILD_IMAGE': 'bin-build', 'BUILD_LAYER_SCRIPT': '6-0-bin-nginx.0-build.sh', 'BUILD_COPY_PATH': '/usr/local/bin/nginx' },
  'F_BIN_FBIT': { 'NAME': 'bin-fluent-bit', 'BASE_IMAGE': 'bin-nginx', 'LAYER_SCRIPT': '6-2-bin-fluent-bit.sh' },

  'F_DEP_FONT': { 'NAME': 'dep-font', 'BASE_IMAGE': 'bin-etc', 'LAYER_SCRIPT': '8-0-dep-font.sh' },
  'F_DEP_PPTR': { 'NAME': 'dep-pptr2603', 'BASE_IMAGE': 'dep-font', 'LAYER_SCRIPT': '8-2-dep-pptr2603.sh' },
  'F_BIN_C_HS': { 'NAME': 'bin-chrome-headless-shell', 'BASE_IMAGE': 'dep-pptr2603', 'LAYER_SCRIPT': '8-4-bin-chrome-headless-shell.sh' },
  'F_BIN_FRFX': { 'NAME': 'bin-firefox', 'BASE_IMAGE': 'bin-chrome-headless-shell', 'LAYER_SCRIPT': '8-6-bin-firefox.sh' },

  'F_SLM_NGNX': { 'NAME': 'slim-nginx', 'BASE_IMAGE': 'bin-common', 'LAYER_SCRIPT': '6-0-bin-nginx.2-check.sh',
    'BUILD_IMAGE': 'bin-nginx', 'BUILD_LAYER_SCRIPT': '6-0-bin-nginx.2-check.sh', 'BUILD_COPY_PATH': '/usr/local/bin/nginx' },
  'F_SLM_MYSQ': { 'NAME': 'slim-mysql80', 'BASE_IMAGE': 'bin-common', 'LAYER_SCRIPT': '9-0-slim-mysql80.sh' },
  'F_SLM_MYCO': { 'NAME': 'slim-mysql80-ci-only', 'BASE_IMAGE': 'slim-mysql80', 'LAYER_SCRIPT': '9-1-slim-mysql80-ci-only.sh' }
}

module.exports = { BUILD_FLAVOR_MAP }
