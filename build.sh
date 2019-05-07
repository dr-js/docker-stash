#!/usr/bin/env bash

SCRIPT_PATH=$( cd "$( dirname "${BASH_SOURCE[0]}" )" ; pwd ) # Absolute path this script is in

( source "${SCRIPT_PATH}/ubuntu1804/build-base.sh" )

( source "${SCRIPT_PATH}/ubuntu1804/build-full.sh" )
( source "${SCRIPT_PATH}/ubuntu1804/build-node.sh" )
( source "${SCRIPT_PATH}/ubuntu1804/build-ruby.sh" )
