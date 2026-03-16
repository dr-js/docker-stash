#!/usr/bin/env bash

source ./0-1-base-apt.sh

# pre-init database files with `root` without password, for faster CI start-up time

{ # less fsync for faster dev IO through-put: https://dba.stackexchange.com/questions/12611/is-it-safe-to-use-innodb-flush-log-at-trx-commit-2
  echo '[mysqld]'
  echo 'innodb_flush_log_at_trx_commit = 0'
  echo 'sync_binlog = 0'
} >> /etc/mysql/conf.d/ci-only.cnf

# pre-init db to save ~10sec for each ci run, but result in ~50MiB larger image
# edited from: https://github.com/docker-library/mysql/blob/84ba05eaa75e1f0e1d33185e23f95a9cdc607b51/8.0/docker-entrypoint.sh#L398
# NOTE: do check output for errors, as timeout will exit with 124 potentially mask some error, 42sec timeout wait should be enough for most arm hardware
gosu mysql "/bin/bash" -xc "$(cat << 'EOM'
  # for testing, use root without password
  export MYSQL_ROOT_PASSWORD=""
  export MYSQL_ALLOW_EMPTY_PASSWORD="yes"
  timeout 42 docker-entrypoint.sh mysqld --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci --default-authentication-plugin=mysql_native_password
  if [[ $? -eq 124 ]]; then echo 'pre-init done'
  else echo 'failed to pre-init'; exit 1
  fi
  set -e
  rm '/var/lib/mysql/#innodb_redo/'*
  rm '/var/lib/mysql/undo_'*
  rm '/var/lib/mysql/'*'.dblwr'
EOM
)"

# log version & info
id mysql
mysql --version
mysqldump --version
mysqld --version
