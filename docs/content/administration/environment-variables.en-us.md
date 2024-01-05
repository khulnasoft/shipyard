---
date: "2017-04-08T11:34:00+02:00"
title: "Environment variables"
slug: "environment-variables"
sidebar_position: 10
toc: false
draft: false
aliases:
  - /en-us/environment-variables
menu:
  sidebar:
    parent: "administration"
    name: "Environment variables"
    sidebar_position: 10
    identifier: "environment-variables"
---

# Environment variables

This is an inventory of Shipyard environment variables. They change Shipyard behaviour.

Initialize them before Shipyard command to be effective, for example:

```sh
SHIPYARD_CUSTOM=/home/shipyard/custom ./shipyard web
```

## From Go language

As Shipyard is written in Go, it uses some Go variables, such as:

- `GOOS`
- `GOARCH`
- [`GOPATH`](https://golang.org/cmd/go/#hdr-GOPATH_environment_variable)

For documentation about each of the variables available, refer to the
[official Go documentation](https://golang.org/cmd/go/#hdr-Environment_variables).

## Shipyard files

- `SHIPYARD_WORK_DIR`: Absolute path of working directory.
- `SHIPYARD_CUSTOM`: Shipyard uses `WorkPath`/custom folder by default. Use this variable to change _custom_ directory.

## Operating system specifics

- `USER`: System user that Shipyard will run as. Used for some repository access strings.
- `USERNAME`: if no `USER` found, Shipyard will use `USERNAME`
- `HOME`: User home directory path. The `USERPROFILE` environment variable is used in Windows.

### Only on Windows

- `USERPROFILE`: User home directory path. If empty, uses `HOMEDRIVE` + `HOMEPATH`
- `HOMEDRIVE`: Main drive path used to access the home directory (C:)
- `HOMEPATH`: Home relative path in the given home drive path

## Miscellaneous

- `SKIP_MINWINSVC`: If set to 1, do not run as a service on Windows.
