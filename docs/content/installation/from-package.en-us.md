---
date: "2016-12-01T16:00:00+02:00"
title: "Installation from package"
slug: "install-from-package"
sidebar_position: 20
toc: false
draft: false
aliases:
  - /en-us/install-from-package
menu:
  sidebar:
    parent: "installation"
    name: "From package"
    sidebar_position: 20
    identifier: "install-from-package"
---

# Installation from Package

## Official packages

### macOS

Currently, the only supported method of installation on MacOS is [Homebrew](http://brew.sh/).
Following the [deployment from binary](installation/from-binary.md) guide may work,
but is not supported. To install Shipyard via `brew`:

```
brew install shipyard
```

## Unofficial packages

### Alpine Linux

Alpine Linux has [Shipyard](https://pkgs.alpinelinux.org/packages?name=shipyard&branch=edge) in its community repository which follows the latest stable version.

```sh
apk add shipyard
```

### Arch Linux

The rolling release distribution has [Shipyard](https://www.archlinux.org/packages/extra/x86_64/shipyard/) in their official extra repository and package updates are provided with new Shipyard releases.

```sh
pacman -S shipyard
```

### Arch Linux ARM

Arch Linux ARM provides packages for [aarch64](https://archlinuxarm.org/packages/aarch64/shipyard), [armv7h](https://archlinuxarm.org/packages/armv7h/shipyard) and [armv6h](https://archlinuxarm.org/packages/armv6h/shipyard).

```sh
pacman -S shipyard
```

### Gentoo Linux

The rolling release distribution has [Shipyard](https://packages.gentoo.org/packages/www-apps/shipyard) in their official community repository and package updates are provided with new Shipyard releases.

```sh
emerge shipyard -va
```

### Canonical Snap

There is a [Shipyard Snap](https://snapcraft.io/shipyard) package which follows the latest stable version.
*Note: The Shipyard snap package is [strictly confined](https://snapcraft.io/docs/snap-confinement). Strictly confined snaps run in complete isolation, so some of the Shipyard functionals may not work with the confinement*

```sh
snap install shipyard
```

### SUSE and openSUSE

OpenSUSE build service provides packages for [openSUSE and SLE](https://software.opensuse.org/download/package?package=shipyard&project=devel%3Atools%3Ascm)
in the Development Software Configuration Management Repository

### Windows

There is a [Shipyard](https://chocolatey.org/packages/shipyard) package for Windows by [Chocolatey](https://chocolatey.org/).

```sh
choco install shipyard
```

Or follow the [deployment from binary](installation/from-binary.md) guide.

### FreeBSD

A FreeBSD port `www/shipyard` is available. To install the pre-built binary package:

```
pkg install shipyard
```

For the most up to date version, or to build the port with custom options,
[install it from the port](https://www.freebsd.org/doc/handbook/ports-using.html):

```
su -
cd /usr/ports/www/shipyard
make install clean
```

The port uses the standard FreeBSD file system layout: config files are in `/usr/local/etc/shipyard`,
bundled templates, options, plugins and themes are in `/usr/local/share/shipyard`, and a start script
is in `/usr/local/etc/rc.d/shipyard`.

To enable Shipyard to run as a service, run `sysrc shipyard_enable=YES` and start it with `service shipyard start`.

### Others

Various other third-party packages of Shipyard exist.
To see a curated list, head over to [awesome-shipyard](https://shipyard.khulnasoft.com/shipyard/awesome-shipyard/src/branch/master/README.md#user-content-packages).

Do you know of an existing package that isn't on the list? Send in a PR to get it added!
