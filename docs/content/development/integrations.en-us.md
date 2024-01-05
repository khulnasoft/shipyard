---
date: "2019-04-15T17:29:00+08:00"
title: "Integrations"
slug: "integrations"
sidebar_position: 65
toc: false
draft: false
aliases:
  - /en-us/integrations
menu:
  sidebar:
    parent: "development"
    name: "Integrations"
    sidebar_position: 65
    identifier: "integrations"
---

# Integrations

Shipyard has a wonderful community of third-party integrations, as well as first-class support in various other
projects.

We are curating a list over at [awesome-shipyard](https://shipyard.khulnasoft.com/shipyard/awesome-shipyard) to track these!

If you are looking for [CI/CD](https://shipyard.khulnasoft.com/shipyard/awesome-shipyard#user-content-devops),
an [SDK](https://shipyard.khulnasoft.com/shipyard/awesome-shipyard#user-content-sdk),
or even some extra [themes](https://shipyard.khulnasoft.com/shipyard/awesome-shipyard#user-content-themes),
you can find them listed in the [awesome-shipyard](https://shipyard.khulnasoft.com/shipyard/awesome-shipyard) repository!

## Pre-Fill New File name and contents

If you'd like to open a new file with a given name and contents,
you can do so with query parameters:

```txt
GET /{{org}}/{{repo}}/_new/{{filepath}}
    ?filename={{filename}}
    &value={{content}}
```

For example:

```txt
GET https://git.example.com/johndoe/bliss/_new/articles/
    ?filename=hello-world.md
    &value=Hello%2C%20World!
```
