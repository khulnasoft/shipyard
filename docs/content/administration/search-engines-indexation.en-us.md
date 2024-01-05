---
date: "2019-12-31T13:55:00+05:00"
title: "Search Engines Indexation"
slug: "search-engines-indexation"
sidebar_position: 60
toc: false
draft: false
aliases:
  - /en-us/search-engines-indexation
menu:
  sidebar:
    parent: "administration"
    name: "Search Engines Indexation"
    sidebar_position: 60
    identifier: "search-engines-indexation"
---

# Search engines indexation of your Shipyard installation

By default your Shipyard installation will be indexed by search engines.
If you don't want your repository to be visible for search engines read further.

## Block search engines indexation using robots.txt

To make Shipyard serve a custom `robots.txt` (default: empty 404) for top level installations,
create a file with path `public/robots.txt` in the [`custom` folder or `CustomPath`](administration/customizing-shipyard.md)

Examples on how to configure the `robots.txt` can be found at [https://moz.com/learn/seo/robotstxt](https://moz.com/learn/seo/robotstxt).

```txt
User-agent: *
Disallow: /
```

If you installed Shipyard in a subdirectory, you will need to create or edit the `robots.txt` in the top level directory.

```txt
User-agent: *
Disallow: /shipyard/
```
