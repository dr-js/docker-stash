#!/usr/bin/env bash

source ./0-1-base-apt.sh

# MNT
MNT_TGZ_REDIS="$(echo /mnt/build-layer-resource/redis-6.*.t*z)"

# edited from Docker Official Image: https://github.com/redis/docker-library-redis/blob/d42d7aec93b1c54dd46f37a66a92f62478456039/6.2/debian/

# already has `tzdata` & `gosu`
apt-update
  apt-install \
    dpkg-dev \
    libc6-dev \
    libssl-dev

	mkdir -p /usr/src/redis
	tar -xzf "${MNT_TGZ_REDIS}" -C /usr/src/redis --strip-components=1

  # disable Redis protected mode [1] as it is unnecessary in context of Docker
  # (ports are not automatically exposed when running inside Docker, but rather explicitly by specifying -p / -P)
  # [1]: https://github.com/redis/redis/commit/edd4d555df57dc84265fdfb4ef59a4678832f6da
	grep -E '^ *createBoolConfig[(]"protected-mode",.*, *1 *,.*[)],$' /usr/src/redis/src/config.c
	sed -ri 's!^( *createBoolConfig[(]"protected-mode",.*, *)1( *,.*[)],)$!\10\2!' /usr/src/redis/src/config.c
	grep -E '^ *createBoolConfig[(]"protected-mode",.*, *0 *,.*[)],$' /usr/src/redis/src/config.c
  # for future reference, we modify this directly in the source instead of just supplying a default configuration flag because apparently "if you specify any argument to redis-server, [it assumes] you are going to specify everything"
  # see also https://github.com/docker-library/redis/issues/4#issuecomment-50780840
  # (more exactly, this makes sure the default behavior of "save on SIGTERM" stays functional by default)

  # https://github.com/jemalloc/jemalloc/issues/467 -- we need to patch the "./configure" for the bundled jemalloc to match how Debian compiles, for compatibility
  # (also, we do cross-builds, so we need to embed the appropriate "--build=xxx" values to that "./configure" invocation)
	gnuArch="$(dpkg-architecture --query DEB_BUILD_GNU_TYPE)"
	extraJemallocConfigureFlags="--build=$gnuArch"
  # https://salsa.debian.org/debian/jemalloc/-/blob/c0a88c37a551be7d12e4863435365c9a6a51525f/debian/rules#L8-23
	dpkgArch="$(dpkg --print-architecture)"
	case "${dpkgArch##*-}" in
		amd64 | i386 | x32) extraJemallocConfigureFlags="$extraJemallocConfigureFlags --with-lg-page=12" ;;
		*) extraJemallocConfigureFlags="$extraJemallocConfigureFlags --with-lg-page=16" ;;
	esac
	extraJemallocConfigureFlags="$extraJemallocConfigureFlags --with-lg-hugepage=21"
	grep -F 'cd jemalloc && ./configure ' /usr/src/redis/deps/Makefile
	sed -ri 's!cd jemalloc && ./configure !&'"$extraJemallocConfigureFlags"' !' /usr/src/redis/deps/Makefile
	grep -F "cd jemalloc && ./configure $extraJemallocConfigureFlags " /usr/src/redis/deps/Makefile

	export BUILD_TLS=yes
	make -C /usr/src/redis -j "$(nproc)" all
	make -C /usr/src/redis install

  # TODO https://github.com/redis/redis/pull/3494 (deduplicate "redis-server" copies)
	serverMd5="$(md5sum /usr/local/bin/redis-server | cut -d' ' -f1)"; export serverMd5
	find /usr/local/bin/redis* -maxdepth 0 \
		-type f -not -name redis-server \
		-exec sh -eux -c '
			md5="$(md5sum "$1" | cut -d" " -f1)";
			test "$md5" = "$serverMd5";
		' -- '{}' ';' \
		-exec ln -svfT 'redis-server' '{}' ';'

	rm -r /usr/src/redis

	redis-cli --version
	redis-server --version
#apt-clear

rm /usr/local/bin/redis-benchmark # drop
ls -al /usr/local/bin/
