#!/usr/bin/env bash

source ./0-0-base.sh

# skip pre-init database files, just ~2sec time save, but ~41MiB larger

# log version & info
id postgres
postgres --version
pg_dump --version
psql --version
