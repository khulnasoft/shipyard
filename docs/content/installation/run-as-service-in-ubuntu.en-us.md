---
date: "2017-07-21T12:00:00+02:00"
title: "Run as a Linux service"
slug: "linux-service"
sidebar_position: 40
toc: false
draft: false
aliases:
  - /en-us/linux-service
menu:
  sidebar:
    parent: "installation"
    name: "Linux service"
    sidebar_position: 40
    identifier: "linux-service"
---

# Run as a Linux service

You can run Shipyard as a Linux service, using either systemd or supervisor. The steps below tested on Ubuntu 16.04, but those should work on any Linux distributions (with little modification).

## Using systemd

Copy the sample [shipyard.service](https://github.com/go-shipyard/shipyard/blob/main/contrib/systemd/shipyard.service) to `/etc/systemd/system/shipyard.service`, then edit the file with your favorite editor.

Uncomment any service that needs to be enabled on this host, such as MySQL.

Change the user, home directory, and other required startup values. Change the
PORT or remove the -p flag if default port is used.

Enable and start Shipyard at boot:

```
sudo systemctl enable shipyard
sudo systemctl start shipyard
```

If you have systemd version 220 or later, you can enable and immediately start Shipyard at once by:

```
sudo systemctl enable shipyard --now
```

## Using supervisor

Install supervisor by running below command in terminal:

```
sudo apt install supervisor
```

Create a log dir for the supervisor logs:

```
# assuming Shipyard is installed in /home/git/shipyard/
mkdir /home/git/shipyard/log/supervisor
```

Append the configuration from the sample
[supervisord config](https://github.com/go-shipyard/shipyard/blob/main/contrib/supervisor/shipyard) to `/etc/supervisor/supervisord.conf`.

Using your favorite editor, change the user (`git`) and home
(`/home/git`) settings to match the deployment environment. Change the PORT
or remove the -p flag if default port is used.

Lastly enable and start supervisor at boot:

```
sudo systemctl enable supervisor
sudo systemctl start supervisor
```

If you have systemd version 220 or later, you can enable and immediately start supervisor by:

```
sudo systemctl enable supervisor --now
```
