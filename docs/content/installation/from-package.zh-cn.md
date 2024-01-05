---
date: "2016-12-01T16:00:00+02:00"
title: "使用包管理器安装"
slug: "install-from-package"
sidebar_position: 20
toc: false
draft: false
aliases:
  - /zh-cn/install-from-package
menu:
  sidebar:
    parent: "installation"
    name: "使用包管理器安装"
    sidebar_position: 20
    identifier: "install-from-package"
---

# 官方包管理器

## macOS

macOS 平台下当前我们仅支持通过 `brew` 来安装。如果你没有安装 [Homebrew](http://brew.sh/)，你也可以查看 [从二进制安装](installation/from-binary.md)。在你安装了 `brew` 之后， 你可以执行以下命令：

```
brew install shipyard
```

# 非官方包管理器

## Alpine Linux

Shipyard 已经包含在 Alpine Linux 的[社区存储库](https://pkgs.alpinelinux.org/packages?name=shipyard&branch=edge)中，版本与 Shipyard 官方保持同步。

```sh
apk add shipyard
```

## Arch Linux

Shipyard 已经在滚动发布发行版的官方[社区存储库](https://www.archlinux.org/packages/community/x86_64/shipyard/)中，版本与 Shipyard 官方保持同步。

```sh
pacman -S shipyard
```

## Arch Linux ARM

官方支持 [aarch64](https://archlinuxarm.org/packages/aarch64/shipyard)， [armv7h](https://archlinuxarm.org/packages/armv7h/shipyard) 和 [armv6h](https://archlinuxarm.org/packages/armv6h/shipyard) 架构。

```sh
pacman -S shipyard
```

## Gentoo Linux

滚动发布的发行版在其官方社区软件仓库中提供了 [Shipyard](https://packages.gentoo.org/packages/www-apps/shipyard)，并且会随着新的 Shipyard 发布提供软件包更新。

```sh
emerge shipyard -va
```

## Canonical Snap

目前 Shipyard 已在 Snap Store 中发布，名称为 [shipyard](https://snapcraft.io/shipyard)。

```sh
snap install shipyard
```

## SUSE/openSUSE

OpenSUSE 构建服务为 [openSUSE 和 SLE](https://software.opensuse.org/download/package?package=shipyard&project=devel%3Atools%3Ascm)
提供包，你可以在开发软件配置管理存储库中找到它们。

## Windows

目前你可以通过 [Chocolatey](https://chocolatey.org/) 来安装 [Shipyard](https://chocolatey.org/packages/shipyard)。

```sh
choco install shipyard
```

你也可以 [从二进制安装](installation/from-binary.md) 。

## FreeBSD

可以使用 Shipyard 的 FreeBSD port `www/shipyard`。 请安装预构建的二进制包：

```
pkg install shipyard
```

对于最新版本，或使用自定义选项构建 port，请
[从 port 安装](https://www.freebsd.org/doc/handbook/ports-using.html)：

```
su -
cd /usr/ports/www/shipyard
make install clean
```

该 port 使用标准的 FreeBSD 文件系统布局：配置文件在 `/usr/local/etc/shipyard` 目录中，
模板、选项、插件和主题在 `/usr/local/share/shipyard` 目录中，启动脚本在 `/usr/local/etc/rc.d/shipyard` 目录中。

要使 Shipyard 作为服务运行，请运行 `sysrc shipyard_enable=YES` 并使用 `service shipyard start` 命令启动它。

## 第三方

如果这里没有找到你喜欢的包管理器，可以使用 Shipyard 第三方软件包。这里有一个完整的列表： [awesome-shipyard](https://shipyard.khulnasoft.com/shipyard/awesome-shipyard/src/branch/master/README.md#user-content-packages)。

如果你知道其他 Shipyard 第三方软件包，请发送 PR 来添加它。
