# Build stage
FROM docker.io/library/golang:1.21-alpine3.19 AS build-env

ARG GOPROXY
ENV GOPROXY ${GOPROXY:-direct}

ARG SHIPYARD_VERSION
ARG TAGS="sqlite sqlite_unlock_notify"
ENV TAGS "bindata timetzdata $TAGS"
ARG CGO_EXTRA_CFLAGS

# Build deps
RUN apk --no-cache add \
    build-base \
    git \
    nodejs \
    npm \
    && rm -rf /var/cache/apk/*

# Setup repo
COPY . ${GOPATH}/src/github.com/khulnasoft/shipyard
WORKDIR ${GOPATH}/src/github.com/khulnasoft/shipyard

# Checkout version if set
RUN if [ -n "${SHIPYARD_VERSION}" ]; then git checkout "${SHIPYARD_VERSION}"; fi \
 && make clean-all build

# Begin env-to-ini build
RUN go build contrib/environment-to-ini/environment-to-ini.go

# Copy local files
COPY docker/root /tmp/local

# Set permissions
RUN chmod 755 /tmp/local/usr/bin/entrypoint \
              /tmp/local/usr/local/bin/shipyard \
              /tmp/local/etc/s6/shipyard/* \
              /tmp/local/etc/s6/openssh/* \
              /tmp/local/etc/s6/.s6-svscan/* \
              /go/src/github.com/khulnasoft/shipyard/shipyard \
              /go/src/github.com/khulnasoft/shipyard/environment-to-ini
RUN chmod 644 /go/src/github.com/khulnasoft/shipyard/contrib/autocompletion/bash_autocomplete

FROM docker.io/library/alpine:3.19
LABEL maintainer="maintainers@shipyard.io"

EXPOSE 22 3000

RUN apk --no-cache add \
    bash \
    ca-certificates \
    curl \
    gettext \
    git \
    linux-pam \
    openssh \
    s6 \
    sqlite \
    su-exec \
    gnupg \
    && rm -rf /var/cache/apk/*

RUN addgroup \
    -S -g 1000 \
    git && \
  adduser \
    -S -H -D \
    -h /data/git \
    -s /bin/bash \
    -u 1000 \
    -G git \
    git && \
  echo "git:*" | chpasswd -e

ENV USER git
ENV SHIPYARD_CUSTOM /data/shipyard

VOLUME ["/data"]

ENTRYPOINT ["/usr/bin/entrypoint"]
CMD ["/bin/s6-svscan", "/etc/s6"]

COPY --from=build-env /tmp/local /
COPY --from=build-env /go/src/github.com/khulnasoft/shipyard/shipyard /app/shipyard/shipyard
COPY --from=build-env /go/src/github.com/khulnasoft/shipyard/environment-to-ini /usr/local/bin/environment-to-ini
COPY --from=build-env /go/src/github.com/khulnasoft/shipyard/contrib/autocompletion/bash_autocomplete /etc/profile.d/shipyard_bash_autocomplete.sh
