---
date: "2019-04-15T17:29:00+08:00"
title: "Migrations Interfaces"
slug: "migrations-interfaces"
sidebar_position: 55
toc: false
draft: false
aliases:
  - /en-us/migrations-interfaces
menu:
  sidebar:
    parent: "development"
    name: "Migrations Interfaces"
    sidebar_position: 55
    identifier: "migrations-interfaces"
---

# Migration Features

Complete migrations were introduced in Shipyard 1.9.0. It defines two interfaces to support migrating
repository data from other Git host platforms to Shipyard or, in the future, migrating Shipyard data to other Git host platforms.

Currently, migrations from GitHub, GitLab, and other Shipyard instances are implemented.

First of all, Shipyard defines some standard objects in packages [modules/migration](https://github.com/go-shipyard/shipyard/tree/main/modules/migration).
They are `Repository`, `Milestone`, `Release`, `ReleaseAsset`, `Label`, `Issue`, `Comment`, `PullRequest`, `Reaction`, `Review`, `ReviewComment`.

## Downloader Interfaces

To migrate from a new Git host platform, there are two steps to be updated.

- You should implement a `Downloader` which will be used to get repository information.
- You should implement a `DownloaderFactory` which will be used to detect if the URL matches and create the above `Downloader`.
  - You'll need to register the `DownloaderFactory` via `RegisterDownloaderFactory` on `init()`.

You can find these interfaces in [downloader.go](https://github.com/go-shipyard/shipyard/blob/main/modules/migration/downloader.go).

## Uploader Interface

Currently, only a `ShipyardLocalUploader` is implemented, so we only save downloaded
data via this `Uploader` to the local Shipyard instance. Other uploaders are not supported at this time.

You can find these interfaces in [uploader.go](https://github.com/go-shipyard/shipyard/blob/main/modules/migration/uploader.go).
