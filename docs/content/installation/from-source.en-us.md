---
date: "2016-12-01T16:00:00+02:00"
title: "Installation from source"
slug: "install-from-source"
sidebar_position: 30
toc: false
draft: false
aliases:
  - /en-us/install-from-source
menu:
  sidebar:
    parent: "installation"
    name: "From source"
    sidebar_position: 30
    identifier: "install-from-source"
---

# Installation from source

You should [install go](https://golang.org/doc/install) and set up your go
environment correctly. In particular, it is recommended to set the `$GOPATH`
environment variable and to add the go bin directory or directories
`${GOPATH//://bin:}/bin` to the `$PATH`. See the Go wiki entry for
[GOPATH](https://github.com/golang/go/wiki/GOPATH).

Next, [install Node.js with npm](https://nodejs.org/en/download/) which is
required to build the JavaScript and CSS files. The minimum supported Node.js
version is @minNodeVersion@ and the latest LTS version is recommended.

**Note**: When executing make tasks that require external tools, like
`make misspell-check`, Shipyard will automatically download and build these as
necessary. To be able to use these, you must have the `"$GOPATH/bin"` directory
on the executable path. If you don't add the go bin directory to the
executable path, you will have to manage this yourself.

**Note 2**: Go version @minGoVersion@ or higher is required. However, it is recommended to
obtain the same version as our continuous integration, see the advice given in
[Hacking on Shipyard](development/hacking-on-shipyard.md)

## Download

First, we must retrieve the source code. Since, the advent of go modules, the
simplest way of doing this is to use Git directly as we no longer have to have
Shipyard built from within the GOPATH.

```bash
git clone https://github.com/go-shipyard/shipyard
```

(Previous versions of this document recommended using `go get`. This is
no longer necessary.)

Decide which version of Shipyard to build and install. Currently, there are
multiple options to choose from. The `main` branch represents the current
development version. To build with main, skip to the [build section](#build).

To work with tagged releases, the following commands can be used:

```bash
git branch -a
git checkout v@version@
```

To validate a Pull Request, first enable the new branch (`xyz` is the PR id;
for example `2663` for [#2663](https://github.com/go-shipyard/shipyard/pull/2663)):

```bash
git fetch origin pull/xyz/head:pr-xyz
```

To build Shipyard from source at a specific tagged release (like v@version@), list the
available tags and check out the specific tag.

List available tags with the following.

```bash
git tag -l
git checkout v@version@  # or git checkout pr-xyz
```

## Build

To build from source, the following programs must be present on the system:

- `go` @minGoVersion@ or higher, see [here](https://golang.org/dl/)
- `node` @minNodeVersion@ or higher with `npm`, see [here](https://nodejs.org/en/download/)
- `make`, see [here](development/hacking-on-shipyard.md#installing-make)

Various [make tasks](https://github.com/go-shipyard/shipyard/blob/main/Makefile)
are provided to keep the build process as simple as possible.

Depending on requirements, the following build tags can be included.

- `bindata`: Build a single monolithic binary, with all assets included. Required for production build.
- `sqlite sqlite_unlock_notify`: Enable support for a
  [SQLite3](https://sqlite.org/) database. Suggested only for tiny
  installations.
- `pam`: Enable support for PAM (Linux Pluggable Authentication Modules). Can
  be used to authenticate local users or extend authentication to methods
  available to PAM.
- `gogit`: (EXPERIMENTAL) Use go-git variants of Git commands.

Bundling all assets (JS/CSS/templates, etc) into the binary. Using the `bindata` build tag is required for
production deployments. You could exclude `bindata` when you are developing/testing Shipyard or able to separate the assets correctly.

To include all assets, use the `bindata` tag:

```bash
TAGS="bindata" make build
```

In the default release build of our continuous integration system, the build
tags are: `TAGS="bindata sqlite sqlite_unlock_notify"`. The simplest
recommended way to build from source is therefore:

```bash
TAGS="bindata sqlite sqlite_unlock_notify" make build
```

The `build` target is split into two sub-targets:

- `make backend` which requires [Go @minGoVersion@](https://golang.org/dl/) or greater.
- `make frontend` which requires [Node.js @minNodeVersion@](https://nodejs.org/en/download/) or greater.

If pre-built frontend files are present it is possible to only build the backend:

```bash
TAGS="bindata" make backend
```

## Test

After following the steps above, a `shipyard` binary will be available in the working directory.
It can be tested from this directory or moved to a directory with test data. When Shipyard is
launched manually from command line, it can be killed by pressing `Ctrl + C`.

```bash
./shipyard web
```

## Changing default paths

Shipyard will search for a number of things from the _`CustomPath`_. By default this is
the `custom/` directory in the current working directory when running Shipyard. It will also
look for its configuration file _`CustomConf`_ in `$(CustomPath)/conf/app.ini`, and will use the
current working directory as the relative base path _`AppWorkPath`_ for a number configurable
values. Finally the static files will be served from _`StaticRootPath`_ which defaults to the _`AppWorkPath`_.

These values, although useful when developing, may conflict with downstream users preferences.

One option is to use a script file to shadow the `shipyard` binary and create an appropriate
environment before running Shipyard. However, when building you can change these defaults
using the `LDFLAGS` environment variable for `make`. The appropriate settings are as follows

- To set the _`CustomPath`_ use `LDFLAGS="-X \"github.com/khulnasoft/shipyard/modules/setting.CustomPath=custom-path\""`
- For _`CustomConf`_ you should use `-X \"github.com/khulnasoft/shipyard/modules/setting.CustomConf=conf.ini\"`
- For _`AppWorkPath`_ you should use `-X \"github.com/khulnasoft/shipyard/modules/setting.AppWorkPath=working-path\"`
- For _`StaticRootPath`_ you should use `-X \"github.com/khulnasoft/shipyard/modules/setting.StaticRootPath=static-root-path\"`
- To change the default PID file location use `-X \"github.com/khulnasoft/shipyard/cmd.PIDFile=/run/shipyard.pid\"`

Add as many of the strings with their preceding `-X` to the `LDFLAGS` variable and run `make build`
with the appropriate `TAGS` as above.

Running `shipyard help` will allow you to review what the computed settings will be for your `shipyard`.

## Cross Build

The `go` compiler toolchain supports cross-compiling to different architecture targets that are supported by the toolchain. See [`GOOS` and `GOARCH` environment variable](https://golang.org/doc/install/source#environment) for the list of supported targets. Cross compilation is helpful if you want to build Shipyard for less-powerful systems (such as Raspberry Pi).

To cross build Shipyard with build tags (`TAGS`), you also need a C cross compiler which targets the same architecture as selected by the `GOOS` and `GOARCH` variables. For example, to cross build for Linux ARM64 (`GOOS=linux` and `GOARCH=arm64`), you need the `aarch64-unknown-linux-gnu-gcc` cross compiler. This is required because Shipyard build tags uses `cgo`'s foreign-function interface (FFI).

Cross-build Shipyard for Linux ARM64, without any tags:

```
GOOS=linux GOARCH=arm64 make build
```

Cross-build Shipyard for Linux ARM64, with recommended build tags:

```
CC=aarch64-unknown-linux-gnu-gcc GOOS=linux GOARCH=arm64 TAGS="bindata sqlite sqlite_unlock_notify" make build
```

Replace `CC`, `GOOS`, and `GOARCH` as appropriate for your architecture target.

You will sometimes need to build a static compiled image. To do this you will need to add:

```
LDFLAGS="-linkmode external -extldflags '-static' $LDFLAGS" TAGS="netgo osusergo $TAGS" make build
```

This can be combined with `CC`, `GOOS`, and `GOARCH` as above.

### Adding bash/zsh autocompletion (from 1.19)

A script to enable bash-completion can be found at [`contrib/autocompletion/bash_autocomplete`](https://raw.githubusercontent.com/go-shipyard/shipyard/main/contrib/autocompletion/bash_autocomplete). This should be altered as appropriate and can be `source` in your `.bashrc`
or copied as `/usr/share/bash-completion/completions/shipyard`.

Similarly, a script for zsh-completion can be found at [`contrib/autocompletion/zsh_autocomplete`](https://raw.githubusercontent.com/go-shipyard/shipyard/main/contrib/autocompletion/zsh_autocomplete). This can be copied to `/usr/share/zsh/_shipyard` or sourced within your
`.zshrc`.

YMMV and these scripts may need further improvement.

## Compile or cross-compile using Linux with Zig

Follow [Getting Started of Zig](https://ziglang.org/learn/getting-started/#installing-zig) to install zig.

- Compile (Linux ➝ Linux)

```sh
CC="zig cc -target x86_64-linux-gnu" \
CGO_ENABLED=1 \
CGO_CFLAGS="-O2 -g -pthread" \
CGO_LDFLAGS="-linkmode=external -v"
GOOS=linux \
GOARCH=amd64 \
TAGS="bindata sqlite sqlite_unlock_notify" \
make build
```

- Cross-compile (Linux ➝ Windows)

```sh
CC="zig cc -target x86_64-windows-gnu" \
CGO_ENABLED=1 \
CGO_CFLAGS="-O2 -g -pthread" \
GOOS=windows \
GOARCH=amd64 \
TAGS="bindata sqlite sqlite_unlock_notify" \
make build
```

## Compile or cross-compile with Zig using Windows

Compile with `GIT BASH`.

- Compile (Windows ➝ Windows)

```sh
CC="zig cc -target x86_64-windows-gnu" \
CGO_ENABLED=1 \
CGO_CFLAGS="-O2 -g -pthread" \
GOOS=windows \
GOARCH=amd64 \
TAGS="bindata sqlite sqlite_unlock_notify" \
make build
```

- Cross-compile (Windows ➝ Linux)

```sh
CC="zig cc -target x86_64-linux-gnu" \
CGO_ENABLED=1 \
CGO_CFLAGS="-O2 -g -pthread" \
CGO_LDFLAGS="-linkmode=external -v"
GOOS=linux \
GOARCH=amd64 \
TAGS="bindata sqlite sqlite_unlock_notify" \
make build
```

## Source Maps

By default, shipyard generates reduced source maps for frontend files to conserve space. This can be controlled with the `ENABLE_SOURCEMAP` environment variable:

- `ENABLE_SOURCEMAP=true` generates all source maps, the default for development builds
- `ENABLE_SOURCEMAP=reduced` generates limited source maps, the default for production builds
- `ENABLE_SOURCEMAP=false` generates no source maps
