ARG BUILD_VERSION=latest
FROM drjs/ubuntu:${BUILD_VERSION}-1804-base

ARG IS_CN_MIRROR=false
LABEL arg.IS_CN_MIRROR=${IS_CN_MIRROR}
ENV DOCKER_BUILD_IS_CN_MIRROR=${IS_CN_MIRROR}

# set build path
WORKDIR /root/.build-script/

COPY ./0-0-base.sh ./

COPY ./1-0-setup.sh ./
RUN ./1-0-setup.sh

COPY ./2-0-install-node.sh ./
RUN ./2-0-install-node.sh

COPY ./2-1-install-npm.sh ./
RUN ./2-1-install-npm.sh

# restore path
WORKDIR /root/
