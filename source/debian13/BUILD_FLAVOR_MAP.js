const BUILD_FLAVOR_MAP = {
  F_BIN_CMMN: { NAME: 'bin-common', BASE_IMAGE: '@CORE', LAYER_SCRIPT: '2-0-bin-common.sh' },
  F_BIN_NODE: { NAME: 'bin-node', BASE_IMAGE: 'bin-common', LAYER_SCRIPT: '2-2-bin-node.sh' },
  F_BIN_SSHD: { NAME: 'bin-sshd', BASE_IMAGE: 'bin-node', LAYER_SCRIPT: '2-4-bin-sshd.sh' },
  F_BIN_ETC_: { NAME: 'bin-etc', BASE_IMAGE: 'bin-sshd', LAYER_SCRIPT: '2-6-bin-etc.sh' },

  F_BIN_GIT_: { NAME: 'bin-git', BASE_IMAGE: 'bin-etc', LAYER_SCRIPT: '4-0-bin-git.sh' },
  F_BIN_RBY3: { NAME: 'bin-ruby3', BASE_IMAGE: 'bin-git', LAYER_SCRIPT: '4-2-bin-ruby3.sh', LAYER_SCRIPT_EXTRA: [ '0-3-base-ruby.sh' ] },
  F_BIN_JAVA: { NAME: 'bin-java', BASE_IMAGE: 'bin-ruby3', LAYER_SCRIPT: '4-4-bin-java.sh' },
  F_BIN_VIPS: { NAME: 'bin-vips', BASE_IMAGE: 'bin-java', LAYER_SCRIPT: '4-5-bin-vips.sh' },
  F_BIN_GO__: { NAME: 'bin-go', BASE_IMAGE: 'bin-vips', LAYER_SCRIPT: '4-6-bin-go.sh' },
  F_BIN_BULD: { NAME: 'bin-build', BASE_IMAGE: 'bin-go', LAYER_SCRIPT: '4-8-bin-build.sh' },

  F_BIN_NGNX: { NAME: 'bin-nginx', BASE_IMAGE: 'bin-vips', LAYER_SCRIPT: '6-0-bin-nginx.2-check.sh',
    BUILD_IMAGE: 'bin-build', BUILD_LAYER_SCRIPT: '6-0-bin-nginx.0-build.sh', BUILD_COPY_PATH: '/usr/local/bin/nginx' },
  F_BIN_FBIT: { NAME: 'bin-fluent-bit', BASE_IMAGE: 'bin-nginx', LAYER_SCRIPT: '6-2-bin-fluent-bit.sh' },

  F_DEP_FONT: { NAME: 'dep-font', BASE_IMAGE: 'bin-git', LAYER_SCRIPT: '8-0-dep-font.sh' },
  F_DEP_PPTR: { NAME: 'dep-pptr2603', BASE_IMAGE: 'dep-font', LAYER_SCRIPT: '8-2-dep-pptr2603.sh',
    LAYER_COMMAND_EXTRA: [ // https://github.com/puppeteer/puppeteer/blob/puppeteer-core-v24.10.0/docs/api/puppeteer.configuration.md
      'ENV PUPPETEER_SKIP_DOWNLOAD=true', // Tells Puppeteer to not download during installation.
      'ENV PUPPETEER_SKIP_CHROME_HEADLESS_SHELL_DOWNLOAD=true', // Tells Puppeteer to not download during installation.
      'ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chrome-headless-shell', // Specifies an executable path to be used in puppeteer.launch.
      'ENV PUPPETEER_BROWSER=chrome',
      'ENV HOME=/tmp' ] },
  F_BIN_C_HS: { NAME: 'bin-chrome-hlsh', BASE_IMAGE: 'dep-pptr2603', LAYER_SCRIPT: '8-4-bin-chrome-hlsh.sh' },
  F_BIN_FRFX: { NAME: 'bin-firefox', BASE_IMAGE: 'bin-chrome-hlsh', LAYER_SCRIPT: '8-6-bin-firefox.sh',
    LAYER_COMMAND_EXTRA: [
      'ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/firefox',
      'ENV PUPPETEER_BROWSER=firefox' ] },

  F_SLM_NGNX: { NAME: 'slim-nginx', BASE_IMAGE: 'bin-common', LAYER_SCRIPT: '6-0-bin-nginx.2-check.sh',
    BUILD_IMAGE: 'bin-nginx', BUILD_LAYER_SCRIPT: '6-0-bin-nginx.2-check.sh', BUILD_COPY_PATH: '/usr/local/bin/nginx' },

  // match usage of: https://hub.docker.com/_/mysql
  F_SLM_MYSQ: { NAME: 'slim-mysql80', BASE_IMAGE: 'bin-common', LAYER_SCRIPT: '9-0-slim-mysql80.sh', LAYER_SCRIPT_EXTRA: [ '9-0-slim-mysql80/' ],
    LAYER_COMMAND_EXTRA: [
      'ENV TZ="UTC"',
      'EXPOSE 3306', // NOTE: expose port 3306 only, to prevent gitlab services health-check waiting 30sec on 33060 for nothing: https://gitlab.com/gitlab-org/gitlab-runner/-/issues/4143#thougts and https://gitlab.com/gitlab-org/gitlab-runner/-/issues/3984#note_687063345
      'ENTRYPOINT [ "docker-entrypoint.sh" ]',
      // use modern UTF8, check: https://github.com/docker-library/docs/tree/master/mysql#configuration-without-a-cnf-file
      // and reset default auth plugin for npm `mysql@2`: https://github.com/mysqljs/mysql/pull/2233#issuecomment-805759987
      'CMD [ "mysqld", "--character-set-server=utf8mb4", "--collation-server=utf8mb4_unicode_ci", "--default-authentication-plugin=mysql_native_password" ]' ] },
  F_SLM_MYCO: { NAME: 'slim-mysql80-ci-only', BASE_IMAGE: 'slim-mysql80', LAYER_SCRIPT: '9-1-slim-mysql80-ci-only.sh',
    LAYER_COMMAND_EXTRA: [ 'ENV MYSQL_ROOT_PASSWORD=""', 'ENV MYSQL_ALLOW_EMPTY_PASSWORD=yes' ] },

  // match usage of: https://hub.docker.com/_/postgres
  F_SLM_PGSQ: { NAME: 'slim-pgsql18', BASE_IMAGE: 'bin-common', LAYER_SCRIPT: '9-3-slim-pgsql18.sh', LAYER_SCRIPT_EXTRA: [ '9-3-slim-pgsql18/' ],
    LAYER_COMMAND_EXTRA: [
      'ENV PG_MAJOR=18',
      'ENV PATH=$PATH:/usr/lib/postgresql/$PG_MAJOR/bin',
      'ENV PGDATA=/var/lib/postgresql/18/docker',
      'ENTRYPOINT [ "docker-entrypoint.sh" ]',
      'STOPSIGNAL SIGINT',
      'EXPOSE 5432',
      'CMD [ "postgres" ]' ] },
  F_SLM_PGCO: { NAME: 'slim-pgsql18-ci-only', BASE_IMAGE: 'slim-pgsql18', LAYER_SCRIPT: '9-4-slim-pgsql18-ci-only.sh',
    LAYER_COMMAND_EXTRA: [
      'ENV POSTGRES_PASSWORD=passwd',
      'ENV POSTGRES_USER=postgres',
      'CMD [ "postgres", "-c", "shared_buffers=64MB", "-c", "max_worker_processes=2", "-c", "max_parallel_workers=2", "-c", "synchronous_commit=off", "-c", "fsync=off" ]' ] },

  // match usage of: https://hub.docker.com/r/valkey/valkey
  F_SLM_VLKS: { NAME: 'slim-valkey9', BASE_IMAGE: 'bin-common', LAYER_SCRIPT: '9-2-slim-valkey9.sh', LAYER_SCRIPT_EXTRA: [ '9-2-slim-valkey9/' ],
    LAYER_COMMAND_EXTRA: [ 'EXPOSE 6379', 'CMD [ "valkey-server" ]', 'WORKDIR "/data"', 'ENTRYPOINT [ "docker-entrypoint.sh" ]' ] }
}

module.exports = { BUILD_FLAVOR_MAP }
