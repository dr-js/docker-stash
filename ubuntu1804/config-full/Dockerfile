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

COPY ./3-0-install-ruby-jemelloc.sh ./
RUN ./3-0-install-ruby-jemelloc.sh

COPY ./3-1-install-gem-bundler.sh ./
RUN ./3-1-install-gem-bundler.sh

COPY ./9-0-install-git.sh ./
RUN ./9-0-install-git.sh

COPY ./9-1-install-ssh.sh ./
RUN ./9-1-install-ssh.sh

COPY ./9-2-install-7z.sh ./
RUN ./9-2-install-7z.sh

COPY ./9-3-install-puppeteer-dep.sh ./
RUN ./9-3-install-puppeteer-dep.sh

# restore path
WORKDIR /root/
