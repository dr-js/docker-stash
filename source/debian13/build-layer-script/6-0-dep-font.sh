#!/usr/bin/env bash

source ./0-1-base-apt.sh

apt-update
  apt-install \
    fonts-liberation2 $(: "provides Arial/Helvetica as the metric is same, and Liberation Mono provides Courier New") \
    fonts-noto-core $(: "for Thai/Arabic/... not small") \
    fonts-noto-cjk $(: "for SC/TC/JP/KR big") \
    fonts-noto-color-emoji

  fc-cache -v # regenerate font cache # NOTE: no file change in layer as the cache is under `/var/cache/fontconfig/` (tmpfs)
apt-clear

# log version & info
fc-list : file | sort
fc-match "Arial" # LiberationSans-Regular.ttf
fc-match "Helvetica" # LiberationSans-Regular.ttf
fc-match "Courier New" # LiberationMono-Regular.ttf
fc-match "Times New Roman" # LiberationSerif-Regular.ttf

fc-match "Noto Sans" # NotoSans-Regular.ttf
fc-match "Noto Sans CJK SC" # NotoSansCJK-Regular.ttc
fc-match "Noto Color Emoji" # NotoColorEmoji.ttf
