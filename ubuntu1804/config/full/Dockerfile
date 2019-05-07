ARG BUILD_VERSION=latest
FROM drjs/ubuntu:${BUILD_VERSION}-1804-base

# now support "CN" only
ARG DOCKER_BUILD_MIRROR=""
LABEL arg.DOCKER_BUILD_MIRROR=${DOCKER_BUILD_MIRROR}
ENV DOCKER_BUILD_MIRROR=${DOCKER_BUILD_MIRROR}

# set build path
WORKDIR /root/.build-script/

COPY ./0-0-base.sh ./

COPY ./1-0-apt-setup.sh ./
RUN ./1-0-apt-setup.sh

COPY ./2-0-node-base.sh ./
COPY ./2-1-node-install.sh ./
RUN ./2-1-node-install.sh

COPY ./3-0-ruby-base.sh ./
COPY ./3-1-ruby-install-jemelloc.sh ./
RUN ./3-1-ruby-install-jemelloc.sh

COPY ./9-0-git.sh ./
RUN ./9-0-git.sh

COPY ./9-1-ssh.sh ./
RUN ./9-1-ssh.sh

COPY ./9-2-7z.sh ./
RUN ./9-2-7z.sh

COPY ./9-3-puppeteer-dep.sh ./
RUN ./9-3-puppeteer-dep.sh

# restore path
WORKDIR /root/
