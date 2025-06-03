#!/usr/bin/env bash

source ./0-1-base-apt.sh

# MNT
MNT_DEB_CHROMIUM="$(echo /mnt/build-layer-resource/chromium_*_${DOCKER_BUILD_ARCH}.deb)"
MNT_DEB_CHROMIUM_COMMON="$(echo /mnt/build-layer-resource/chromium-common_*_${DOCKER_BUILD_ARCH}.deb)"
MNT_DEB_FIREFOX="$(echo /mnt/build-layer-resource/firefox_*_${DOCKER_BUILD_ARCH}_*.deb)"

apt-update
  # direct unpack `.deb` # TODO: NOTE: will install 117MB `libLLVM-15.so.1` and 23MB `libz3.so.4` through `x11-utils -> libgl1 -> libglx0 -> libglx-mesa0 -> libgl1-mesa-dri`
  # dpkg -i "${MNT_DEB_CHROMIUM}" || apt-install --fix-broken # fix missing dependencies
  mkdir -p /tmp/deb-unpack/chromium/
  mkdir -p /tmp/deb-unpack/chromium-common/
  dpkg-deb --extract "${MNT_DEB_CHROMIUM}" /tmp/deb-unpack/chromium/
  dpkg-deb --extract "${MNT_DEB_CHROMIUM_COMMON}" /tmp/deb-unpack/chromium-common/
  mkdir -p /usr/lib/chromium/
  mv /tmp/deb-unpack/chromium/usr/lib/chromium/* /usr/lib/chromium/
  mv /tmp/deb-unpack/chromium-common/usr/lib/chromium/* /usr/lib/chromium/
  rm -r /tmp/deb-unpack/
  ln -sfT ../lib/chromium/chromium /usr/bin/chromium
  # find missing lib with:
  #   ldd chromium | grep 'not found'
  #   dpkg -S libnss3.so
  apt-install libdav1d6 libdouble-conversion3 libflac12 libgbm1 libharfbuzz-subset0 libminizip1 libnspr4 libnss3 libopenh264-7 libopenjp2-7 libopus0 libpulse0 libxnvctrl0 libxslt1.1

  dpkg -i "${MNT_DEB_FIREFOX}" || apt-install --fix-broken # fix missing dependencies
apt-clear

if ldd /usr/bin/chromium | grep "not found"
then ldd /usr/bin/chromium && false # log what's wrong & return error
else echo "[ldd pass]"
fi
