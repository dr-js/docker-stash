#!/usr/bin/env bash

set -xe # enable shell command log & exit on error

function make-public-readable { chmod --recursive --changes a+rX "$@"; } # make all file readable (+r), and dir content accessible (+X)
function make-public-writable { chmod --recursive --changes a+rwX "$@"; } # make all file readable & writable (+rw), and dir content accessible (+X)

function create-user-with-sudo {
  # create user with given uid, and grant sudo without password
  # should run as root: `create-user-with-sudo 17522 dr "Dr Dev User"`

  # args with default like Debian
  USER_ID="${1-"1000"}"
  USER_NAME="${2-"app"}"
  USER_FULL_NAME="${3-"App User"}"

  useradd \
    --password "" $(: "The default is to disable the password.") \
    --expiredate "" $(: "The date on which the user account will be disabled. An empty string (no expiry) by default.") \
    --inactive -1 $(: "The number of days after a password expires until the account is permanently disabled. A value of -1 disables the feature.") \
    --shell "/bin/bash" $(: "The name of the user's login shell.") \
    --uid "${USER_ID}" $(: "The numerical value of the user's ID. This value must be unique.") \
    --user-group $(: "Create a group with the same name as the user, and add the user to this group.") \
    --comment "${USER_FULL_NAME}" $(: "GECOS field of the new account") \
    --create-home $(: "Create the user's home directory if it does not exist.") \
    "${USER_NAME}" $(: "User login name, should be all lowercase.")

  id "${USER_NAME}" # verify the uid/gid

  echo "${USER_NAME} ALL=(ALL) NOPASSWD:ALL" | EDITOR='tee -a' visudo # lazy way to allow sudo without password # https://stackoverflow.com/questions/323957/how-do-i-edit-etc-sudoers-from-a-script/28382838#28382838
}
