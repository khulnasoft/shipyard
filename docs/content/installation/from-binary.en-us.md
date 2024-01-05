---
date: "2017-06-19T12:00:00+02:00"
title: "Installation from binary"
slug: "install-from-binary"
sidebar_position: 15
toc: false
draft: false
aliases:
  - /en-us/install-from-binary
menu:
  sidebar:
    parent: "installation"
    name: "From binary"
    sidebar_position: 15
    identifier: "install-from-binary"
---

# Installation from binary

All downloads come with SQLite, MySQL and PostgreSQL support, and are built with
embedded assets. This can be different from Gogs.

## Download

You can find the file matching your platform from the [downloads page](https://dl.shipyard.khulnasoft.com/shipyard/) after navigating to the version you want to download.

### Choosing the right file

**For Linux**, you will likely want `linux-amd64`. It's for 64-bit Intel/AMD platforms, but there are other platforms available, including `arm64` (e.g. Raspberry PI 4), `386` (i.e. 32-bit), `arm-5`, and `arm-6`.

**For Windows**, you will likely want `windows-4.0-amd64`. It's for all modern versions of Windows, but there is also a `386` platform available designed for older, 32-bit versions of Windows.

*Note: there is also a `gogit-windows` file available that was created to help with some [performance problems](https://github.com/go-shipyard/shipyard/pull/15482) reported by some Windows users on older systems/versions. You should consider using this file if you're experiencing performance issues, and let us know if it improves performance.*

**For macOS**, you should choose `darwin-arm64` if your hardware uses Apple Silicon, or `darwin-amd64` for Intel.

**For FreeBSD**, you should choose `freebsd12-amd64` for 64-bit Intel/AMD platforms.

### Downloading with wget

Copy the commands below and replace the URL within the one you wish to download.

```sh
wget -O shipyard https://dl.shipyard.khulnasoft.com/shipyard/@version@/shipyard-@version@-linux-amd64
chmod +x shipyard
```

Note that the above command will download Shipyard @version@ for 64-bit Linux.

## Verify GPG signature

Shipyard signs all binaries with a [GPG key](https://keys.openpgp.org/search?q=teabot%40shipyard.io) to prevent against unwanted modification of binaries.
To validate the binary, download the signature file which ends in `.asc` for the binary you downloaded and use the GPG command line tool.

```sh
gpg --keyserver keys.openpgp.org --recv 7C9E68152594688862D62AF62D9AE806EC1592E2
gpg --verify shipyard-@version@-linux-amd64.asc shipyard-@version@-linux-amd64
```

Look for the text `Good signature from "Teabot <teabot@shipyard.io>"` to assert a good binary,
despite warnings like `This key is not certified with a trusted signature!`.

## Recommended server configuration

**NOTE:** Many of the following directories can be configured using [Environment Variables](administration/environment-variables.md) as well!
Of note, configuring `SHIPYARD_WORK_DIR` will tell Shipyard where to base its working directory, as well as ease installation.

### Prepare environment

Check that Git is installed on the server. If it is not, install it first. Shipyard requires Git version >= 2.0.

```sh
git --version
```

Create a user to run Shipyard (e.g. `git`)

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

### Create required directory structure

```sh
mkdir -p /var/lib/shipyard/{custom,data,log}
chown -R git:git /var/lib/shipyard/
chmod -R 750 /var/lib/shipyard/
mkdir /etc/shipyard
chown root:git /etc/shipyard
chmod 770 /etc/shipyard
```

> **NOTE:** `/etc/shipyard` is temporarily set with write permissions for user `git` so that the web installer can write the configuration file. After the installation is finished, it is recommended to set permissions to read-only using:
>
> ```sh
> chmod 750 /etc/shipyard
> chmod 640 /etc/shipyard/app.ini
> ```

If you don't want the web installer to be able to write to the config file, it is possible to make the config file read-only for the Shipyard user (owner/group `root:git`, mode `0640`) however you will need to edit your config file manually to:

* Set `INSTALL_LOCK= true`,
* Ensure all database configuration details are set correctly
* Ensure that the `SECRET_KEY` and `INTERNAL_TOKEN` values are set. (You may want to use the `shipyard generate secret` to generate these secret keys.)
* Ensure that any other secret keys you need are set.

See the [command line documentation](administration/command-line.md) for information on using `shipyard generate secret`.

### Configure Shipyard's working directory

**NOTE:** If you plan on running Shipyard as a Linux service, you can skip this step, as the service file allows you to set `WorkingDirectory`. Otherwise, consider setting this environment variable (semi-)permanently so that Shipyard consistently uses the correct working directory.

```sh
export SHIPYARD_WORK_DIR=/var/lib/shipyard/
```

### Copy the Shipyard binary to a global location

```sh
cp shipyard /usr/local/bin/shipyard
```

### Adding bash/zsh autocompletion (from 1.19)

A script to enable bash-completion can be found at [`contrib/autocompletion/bash_autocomplete`](https://raw.githubusercontent.com/go-shipyard/shipyard/main/contrib/autocompletion/bash_autocomplete). This can be copied to `/usr/share/bash-completion/completions/shipyard`
or sourced within your `.bashrc`.

Similarly a script for zsh-completion can be found at [`contrib/autocompletion/zsh_autocomplete`](https://raw.githubusercontent.com/go-shipyard/shipyard/main/contrib/autocompletion/zsh_autocomplete). This can be copied to `/usr/share/zsh/_shipyard` or sourced within your
`.zshrc`.

YMMV and these scripts may need further improvement.

## Running Shipyard

After you complete the above steps, you can run Shipyard two ways:

### 1. Creating a service file to start Shipyard automatically (recommended)

See how to create [Linux service](installation/run-as-service-in-ubuntu.md)

### 2. Running from command-line/terminal

```sh
SHIPYARD_WORK_DIR=/var/lib/shipyard/ /usr/local/bin/shipyard web -c /etc/shipyard/app.ini
```

## Updating to a new version

You can update to a new version of Shipyard by stopping Shipyard, replacing the binary at `/usr/local/bin/shipyard` and restarting the instance.
The binary file name should not be changed during the update to avoid problems in existing repositories.

It is recommended that you make a [backup](administration/backup-and-restore.md) before updating your installation.

If you have carried out the installation steps as described above, the binary should
have the generic name `shipyard`. Do not change this, i.e. to include the version number.

### 1. Restarting Shipyard with systemd (recommended)

As we explained before, we recommend to use systemd as the service manager. In this case, `systemctl restart shipyard` should be fine.

### 2. Restarting Shipyard without systemd

To restart your Shipyard instance, we recommend to use SIGHUP signal. If you know your Shipyard PID, use `kill -1 $SHIPYARD_PID`, otherwise you can use `killall -1 shipyard`.

To gracefully stop the Shipyard instance, a simple `kill $SHIPYARD_PID` or `killall shipyard` is enough.

**NOTE:** We don't recommend to use the SIGKILL signal (`-9`); you may be forcefully stopping some of Shipyard's internal tasks, and it will not gracefully stop (tasks in queues, indexers, etc.)

See below for troubleshooting instructions to repair broken repositories after
an update of your Shipyard version.

## Troubleshooting

### Old glibc versions

Older Linux distributions (such as Debian 7 and CentOS 6) may not be able to load the
Shipyard binary, usually producing an error such as `./shipyard: /lib/x86_64-linux-gnu/libc.so.6:
version 'GLIBC\_2.14' not found (required by ./shipyard)`. This is due to the integrated
SQLite support in the binaries provided by dl.shipyard.khulnasoft.com. In this situation, it is usually
possible to [install from source](installation/from-source.md), without including
SQLite support.

### Running Shipyard on another port

For errors like `702 runWeb()] [E] Failed to start server: listen tcp 0.0.0.0:3000:
bind: address already in use`, Shipyard needs to be started on another free port. This
is possible using `./shipyard web -p $PORT`. It's possible another instance of Shipyard
is already running.

### Running Shipyard on Raspbian

As of v1.8, there is a problem with the arm7 version of Shipyard, and it doesn't run on Raspberry Pis and similar devices.

It is recommended to switch to the arm6 version, which has been tested and shown to work on Raspberry Pis and similar devices.

<!---
please remove after fixing the arm7 bug
--->
### Git error after updating to a new version of Shipyard

If during the update, the binary file name has been changed to a new version of Shipyard,
Git Hooks in existing repositories will not work any more. In that case, a Git
error will be displayed when pushing to the repository.

```
remote: ./hooks/pre-receive.d/shipyard: line 2: [...]: No such file or directory
```

The `[...]` part of the error message will contain the path to your previous Shipyard
binary.

To solve this, go to the admin options and run the task `Resynchronize pre-receive,
update and post-receive hooks of all repositories` to update all hooks to contain
the new binary path. Please note that this overwrites all Git Hooks, including ones
with customizations made.

If you aren't using the Shipyard built-in SSH server, you will also need to re-write
the authorized key file by running the `Update the '.ssh/authorized_keys' file with
Shipyard SSH keys.` task in the admin options.
