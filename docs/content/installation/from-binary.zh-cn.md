---
date: "2016-12-01T16:00:00+02:00"
title: "使用二进制文件安装"
slug: "install-from-binary"
sidebar_position: 15
toc: false
draft: false
aliases:
  - /zh-cn/install-from-binary
menu:
  sidebar:
    parent: "installation"
    name: "使用二进制文件安装"
    sidebar_position: 15
    identifier: "install-from-binary"
---

# 使用二进制文件安装

所有打包的二进制程序均包含 SQLite，MySQL 和 PostgreSQL 的数据库连接支持，同时网站的静态资源均已嵌入到可执行程序中，这一点和曾经的 Gogs 有所不同。

## 下载

你可以从 [下载页面](https://dl.shipyard.khulnasoft.com/shipyard/) 选择对应平台的二进制文件。

### 选择架构

- **对于 Linux**，`linux-amd64` 适用于 64-bit 的 Intel/AMD 平台。更多架构包含 `arm64` (Raspberry PI 4)，`386` (32-bit)，`arm-5` 以及 `arm-6`。

- **对于 Windows**，`windows-4.0-amd64` 适用于 64-bit 的 Intel/AMD 平台，`386` 适用于 32-bit 的 Intel/AMD 平台。（提示：`gogit-windows` 版本内建了 gogit 可能缓解在旧的 Windows 平台上 Go 程序调用 git 子程序时面临的 [性能问题](https://github.com/go-shipyard/shipyard/pull/15482)）

- **对于 macOS**，`darwin-arm64` 适用于 Apple Silicon 架构，`darwin-amd64` 适用于 Intel 架构.

- **对于 FreeBSD**，`freebsd12-amd64` 适用于 64-bit 的 Intel/AMD 平台。

### 使用 wget 下载

使用以下命令下载适用于 64-bit Linux 平台的二进制文件。

```sh
wget -O shipyard https://dl.shipyard.khulnasoft.com/shipyard/@version@/shipyard-@version@-linux-amd64
chmod +x shipyard
```

## 验证 GPG 签名

Shipyard 对打包的二进制文件使用 [GPG密钥](https://keys.openpgp.org/search?q=teabot%40shipyard.io) 签名以防止篡改。
请根据对应文件名 `.asc` 中包含的校验码检验文件的一致性。

```sh
gpg --keyserver keys.openpgp.org --recv 7C9E68152594688862D62AF62D9AE806EC1592E2
gpg --verify shipyard-@version@-linux-amd64.asc shipyard-@version@-linux-amd64
```

校验正确时的信息为 `Good signature from "Teabot <teabot@shipyard.io>"`。
校验错误时的信息为 `This key is not certified with a trusted signature!`。

## 服务器设置

**提示：** `SHIPYARD_WORK_DIR` 表示 Shipyard 工作的路径。以下路径可以通过 [环境变量](administration/environment-variables.md) 初始化。

### 准备环境

检查是否安装 Git。要求 Git 版本 >= 2.0。

```sh
git --version
```

创建用户（推荐使用名称 `git`）

```sh
# On Ubuntu/Debian:
adduser \
   --system \
   --shell /bin/bash \
   --gecos 'Git Version Control' \
   --group \
   --disabled-password \
   --home /home/git \
   git

# On Fedora/RHEL/CentOS:
groupadd --system git
adduser \
   --system \
   --shell /bin/bash \
   --comment 'Git Version Control' \
   --gid git \
   --home-dir /home/git \
   --create-home \
   git
```

### 创建工作路径

```sh
mkdir -p /var/lib/shipyard/{custom,data,log}
chown -R git:git /var/lib/shipyard/
chmod -R 750 /var/lib/shipyard/
mkdir /etc/shipyard
chown root:git /etc/shipyard
chmod 770 /etc/shipyard
```

> **注意：** 为了让 Web 安装程序可以写入配置文件，我们临时为 `/etc/shipyard` 路径授予了组外用户 `git` 写入权限。建议在安装结束后将配置文件的权限设置为只读。
>
> ```sh
> chmod 750 /etc/shipyard
> chmod 640 /etc/shipyard/app.ini
> ```

如果您不希望通过 Web 安装程序创建配置文件，可以将配置文件设置为仅供 Shipyard 用户只读（owner/group `root:git`, mode `0640`）并手工创建配置文件：

- 设置 `INSTALL_LOCK=true` 关闭安装界面
- 手动配置数据库连接参数
- 使用 `shipyard generate secret` 创建 `SECRET_KEY` 和 `INTERNAL_TOKEN`
- 提供所有必要的密钥

详情参考 [命令行文档](administration/command-line.md) 中有关 `shipyard generate secret` 的内容。

### 配置 Shipyard 工作路径

**提示：** 如果使用 Systemd 管理 Shipyard 的 Linux 服务，你可以采用 `WorkingDirectory` 参数来配置工作路径。 否则，使用环境变量 `SHIPYARD_WORK_DIR` 来明确指出程序工作和数据存放路径。

```sh
export SHIPYARD_WORK_DIR=/var/lib/shipyard/
```

### 复制二进制文件到全局位置

```sh
cp shipyard /usr/local/bin/shipyard
```

### 添加 bash/zsh 自动补全（从 1.19 版本开始）

可以在 [`contrib/autocompletion/bash_autocomplete`](https://raw.githubusercontent.com/go-shipyard/shipyard/main/contrib/autocompletion/bash_autocomplete) 找到启用 bash 自动补全的脚本。可以将其复制到 `/usr/share/bash-completion/completions/shipyard`，或在 `.bashrc` 中引用。

同样地，zsh 自动补全的脚本可以在 [`contrib/autocompletion/zsh_autocomplete`](https://raw.githubusercontent.com/go-shipyard/shipyard/main/contrib/autocompletion/zsh_autocomplete) 找到。您可以将其复制到 `/usr/share/zsh/_shipyard`，或在您的 `.zshrc` 中引用。

具体情况可能会有所不同，这些脚本可能需要进一步的改进。

## 运行 Shipyard

完成以上步骤后，可以通过两种方式运行 Shipyard：

### 1. 创建服务自动启动 Shipyard（推荐）

学习创建 [Linux 服务](installation/run-as-service-in-ubuntu.md)

### 2. 通过命令行终端运行

```sh
SHIPYARD_WORK_DIR=/var/lib/shipyard/ /usr/local/bin/shipyard web -c /etc/shipyard/app.ini
```

## 升级到最新版本

您可以通过停止程序，替换 `/usr/local/bin/shipyard` 并重启来更新到新版本。直接替换可执行程序时不要更改或使用新的文件名称，以避免数据出错。

建议您在更新之前进行[备份](administration/backup-and-restore.md)。

如果您按照上述描述执行了安装步骤，二进制文件的通用名称应为 shipyard。请勿更改此名称，即不要包含版本号。

### 1. 使用 systemd 重新启动 Shipyard（推荐）

我们建议使用 systemd 作为服务管理器，使用 `systemctl restart shipyard` 安全地重启程序。

### 2. 非 systemd 重启方法

使用 SIGHUP 信号关闭程序：查询到 Shipyard 程序的 PID，使用 `kill -1 $SHIPYARD_PID`，或者 `killall -1 shipyard`。

更优雅的停止指令可能包括 `kill $SHIPYARD_PID` 或者 `killall shipyard`。

**提示：** 我们不建议使用 SIGKILL 信号（`-9`），这会强制停止 Shipyard 程序，但不会正确关闭队列、索引器等任务。

请参阅下面的疑难解答说明，以在Shipyard版本更新后修复损坏的仓库。

## 排查故障

### 旧版 glibc

旧版 Linux 发行版（例如 Debian 7 和 CentOS 6）可能无法加载 Shipyard 二进制文件，通常会产生类似于 `./shipyard: /lib/x86_64-linux-gnu/libc.so.6:
version 'GLIBC\_2.14' not found (required by ./shipyard)` 的错误。这是由于 dl.shipyard.khulnasoft.com 提供的二进制文件中集成了 SQLite 支持。在这种情况下，通常可以选择[从源代码安装](installation/from-source.md)，而不包括 SQLite 支持。

### 在另一个端口上运行 Shipyard

对于出现类似于 `702 runWeb()] [E] Failed to start server: listen tcp 0.0.0.0:3000:
bind: address already in use` 的错误，需要将 Shipyard 启动在另一个空闲端口上。您可以使用 `./shipyard web -p $PORT` 来实现。可能已经有另一个 Shipyard 实例在运行。

### 在 Raspbian 上运行 Shipyard

从 v1.8 版本开始，arm7 版本的 Shipyard 存在问题，无法在树莓派和类似设备上运行。

建议切换到 arm6 版本，该版本经过测试并已被证明可以在树莓派和类似设备上运行。

### 更新到新版本的 Shipyard 后出现的 Git 错误

如果在更新过程中，二进制文件的名称已更改为新版本的 Shipyard，则现有仓库中的 Git 钩子将不再起作用。在这种情况下，当推送到仓库时，会显示 Git 错误。

```
remote: ./hooks/pre-receive.d/shipyard: line 2: [...]: No such file or directory
```

错误信息中的 `[...]` 部分将包含您先前 Shipyard 二进制文件的路径。

要解决此问题，请转到管理选项，并运行任务 `Resynchronize pre-receive, update and post-receive hooks of all repositories`，以将所有钩子更新为包含新的二进制文件路径。请注意，这将覆盖所有 Git 钩子，包括自定义的钩子。

如果您没有使用 Shipyard 内置的 SSH 服务器，您还需要通过在管理选项中运行任务 `Update the '.ssh/authorized_keys' file with Shipyard SSH keys.` 来重新编写授权密钥文件。

> 更多经验总结，请参考英文版 [Troubleshooting](https://docs.shipyard.khulnasoft.com/installation/install-from-binary#troubleshooting)

如果从本页中没有找到你需要的内容，请访问 [帮助页面](help/support.md)
