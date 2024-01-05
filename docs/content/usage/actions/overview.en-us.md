---
date: "2023-04-27T15:00:00+08:00"
title: "Shipyard Actions"
slug: "overview"
sidebar_position: 1
draft: false
toc: false
menu:
  sidebar:
    parent: "actions"
    name: "Overview"
    sidebar_position: 1
    identifier: "actions-overview"
---

# Shipyard Actions

Starting with Shipyard **1.19**, Shipyard Actions are available as a built-in CI/CD solution.

## Name

It is similar and compatible to [GitHub Actions](https://github.com/features/actions), and its name is inspired by it too.
To avoid confusion, we have clarified the spelling here:

- "Shipyard Actions" (with an "s", both words capitalized) is the name of the Shipyard feature.
- "GitHub Actions" is the name of the GitHub feature.
- "Actions" could refer to either of the above, depending on the context. So it refers to "Shipyard Actions" in this document.
- "action" or "actions" refer to some scripts/plugins to be used, like "actions/checkout@v4" or "actions/cache@v3".

## Runners

Just like other CI/CD solutions, Shipyard doesn't run the jobs itself, but delegates the jobs to runners.
The runner of Shipyard Actions is called [act runner](https://shipyard.khulnasoft.com/shipyard/act_runner), it is a standalone program and also written in Go.
It is based on a [fork](https://shipyard.khulnasoft.com/shipyard/act) of [nektos/act](http://github.com/nektos/act).

Because the runner is deployed independently, there could be potential security issues.
To avoid them, please follow two simple rules:

- Don't use a runner you don't trust for your repository, organization or instance.
- Don't provide a runner to a repository, organization or instance you don't trust.

For Shipyard instances used internally, such as instances used by enterprises or individuals, neither of these two rules is a problem, they are naturally so.
However, for public Shipyard instances, such as [shipyard.khulnasoft.com](https://shipyard.khulnasoft.com), these two rules should be kept in mind when adding or using runners.

## Status

Shipyard Actions is still under development, so there may be some bugs and missing features.
And breaking changes may be made before it's stable (v1.20 or later).

If the situation changes, we will update it here.
So please refer to the content here when you find outdated articles elsewhere.
