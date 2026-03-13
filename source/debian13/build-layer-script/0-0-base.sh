#!/usr/bin/env bash

set -xeo pipefail # enable shell command log & exit on error

function ldd-chk {
  TGT_BIN="$1"
  if ldd "${TGT_BIN}" | grep "not found"
  then ldd "${TGT_BIN}"; exit 1 # log what's wrong & return error
  else echo "[ldd pass: ${TGT_BIN}]"
  fi
}
