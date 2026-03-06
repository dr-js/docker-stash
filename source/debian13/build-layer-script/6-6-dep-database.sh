#!/usr/bin/env bash

source ./0-1-base-apt.sh

apt-update
  apt-install \
    libmariadb3 $(: "for MySQL") \
    libpq5 $(: "for pg(PostgreSQL)")
apt-clear

if ldd /usr/lib/*-linux-gnu/libmariadb.so.3 | grep "not found"
then ldd /usr/lib/*-linux-gnu/libmariadb.so.3 && false # log what's wrong & return error
else echo "[ldd pass: libmariadb]"
fi

if ldd /usr/lib/*-linux-gnu/libpq.so.5 | grep "not found"
then ldd /usr/lib/*-linux-gnu/libpq.so.5 && false # log what's wrong & return error
else echo "[ldd pass: libpq]"
fi

# log version & info
ls -al /usr/lib/*-linux-gnu/libmariadb.so.3
ls -al /usr/lib/*-linux-gnu/libpq.so.5
