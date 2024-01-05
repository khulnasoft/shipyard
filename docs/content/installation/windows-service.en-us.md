---
date: "2016-12-21T15:00:00-02:00"
title: "Register as a Windows service"
slug: "windows-service"
sidebar_position: 50
toc: false
draft: false
aliases:
  - /en-us/windows-service
menu:
  sidebar:
    parent: "installation"
    name: "Windows Service"
    sidebar_position: 50
    identifier: "windows-service"
---
# Register as a Windows service

## Prerequisites

The following changes are made in C:\shipyard\custom\conf\app.ini:

```
RUN_USER = COMPUTERNAME$
```

Sets Shipyard to run as the local system user.

COMPUTERNAME is whatever the response is from `echo %COMPUTERNAME%` on the command line. If the response is `USER-PC` then `RUN_USER = USER-PC$`

### Use absolute paths

If you use SQLite3, change the `PATH` to include the full path:

```
[database]
PATH     = c:/shipyard/data/shipyard.db
```

## Register Shipyard

To register Shipyard as a Windows service, open a command prompt (cmd) as an Administrator,
then run the following command:

```
sc.exe create shipyard start= auto binPath= "\"C:\shipyard\shipyard.exe\" web --config \"C:\shipyard\custom\conf\app.ini\""
```

Do not forget to replace `C:\shipyard` with the correct Shipyard directory.

Open "Windows Services", search for the service named "shipyard", right-click it and click on
"Run". If everything is OK, Shipyard will be reachable on `http://localhost:3000` (or the port
that was configured).

### Service startup type

It was observed that on loaded systems during boot Shipyard service may fail to start with timeout records in Windows Event Log.
In that case change startup type to `Automatic-Delayed`. This can be done during service creation, or by running config command

```
sc.exe config shipyard start= delayed-auto
```

### Adding startup dependencies

To add a startup dependency to the Shipyard Windows service (eg Mysql, Mariadb), as an Administrator, then run the following command:

```
sc.exe config shipyard depend= mariadb
```

This will ensure that when the Windows machine restarts, the automatic starting of Shipyard is postponed until the database is ready and thus mitigate failed startups.

## Unregister Shipyard

To unregister Shipyard as a Windows service, open a command prompt (cmd) as an Administrator and run:

```
sc.exe delete shipyard
```
