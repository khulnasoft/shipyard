---
date: "2017-04-15T14:56:00+02:00"
title: "自定义 Shipyard 配置"
slug: "customizing-shipyard"
sidebar_position: 100
toc: false
draft: false
aliases:
  - /zh-cn/customizing-shipyard
menu:
  sidebar:
    parent: "administration"
    name: "自定义 Shipyard 配置"
    sidebar_position: 100
    identifier: "customizing-shipyard"
---

# 自定义 Shipyard 配置

Shipyard 引用 `custom` 目录中的自定义配置文件来覆盖配置、模板等默认配置。

如果从二进制部署 Shipyard ，则所有默认路径都将相对于该 shipyard 二进制文件；如果从发行版安装，则可能会将这些路径修改为Linux文件系统标准。Shipyard
将会自动创建包括 `custom/` 在内的必要应用目录，应用本身的配置存放在
`custom/conf/app.ini` 当中。在发行版中可能会以 `/etc/shipyard/` 的形式为 `custom` 设置一个符号链接，查看配置详情请移步：

- [快速备忘单](administration/config-cheat-sheet.md)
- [完整配置清单](https://github.com/go-shipyard/shipyard/blob/main/custom/conf/app.example.ini)

如果您在 binary 同目录下无法找到 `custom` 文件夹，请检查您的 `SHIPYARD_CUSTOM`
环境变量配置， 因为它可能被配置到了其他地方（可能被一些启动脚本设置指定了目录）。

- [环境变量清单](administration/environment-variables.md)

**注：** 必须完全重启 Shipyard 以使配置生效。

## 使用自定义 /robots.txt

将 [想要展示的内容](http://www.robotstxt.org/) 存放在 `custom` 目录中的
`robots.txt` 文件来让 Shipyard 使用自定义的`/robots.txt` （默认：空 404）。

## 使用自定义的公共文件

将自定义的公共文件（比如页面和图片）作为 webroot 放在 `custom/public/` 中来让 Shipyard 提供这些自定义内容（符号链接将被追踪）。

举例说明：`image.png` 存放在 `custom/public/assets/`中，那么它可以通过链接 http://shipyard.domain.tld/assets/image.png 访问。

## 修改默认头像

替换以下目录中的 png 图片： `custom/public/assets/img/avatar\_default.png`

## 自定义 Shipyard 页面

您可以改变 Shipyard `custom/templates` 的每个单页面。您可以在 Shipyard 源码的 `templates` 目录中找到用于覆盖的模板文件，应用将根据
`custom/templates` 目录下的路径结构进行匹配和覆盖。

包含在 `{{` 和 `}}` 中的任何语句都是 Shipyard 的模板语法，如果您不完全理解这些组件，不建议您对它们进行修改。

### 添加链接和页签

如果您只是想添加额外的链接到顶部导航栏或额外的选项卡到存储库视图，您可以将它们放在您 `custom/templates/custom/` 目录下的 `extra_links.tmpl` 和 `extra_tabs.tmpl` 文件中。

举例说明：假设您需要在网站放置一个静态的“关于”页面，您只需将该页面放在您的
"custom/public/"目录下（比如 `custom/public/impressum.html`）并且将它与 `custom/templates/custom/extra_links.tmpl` 链接起来即可。

这个链接应当使用一个名为“item”的 class 来匹配当前样式，您可以使用 `{{AppSubUrl}}` 来获取 base URL:
`<a class="item" href="{{AppSubUrl}}/assets/impressum.html">Impressum</a>`

同理，您可以将页签添加到 `extra_tabs.tmpl` 中，使用同样的方式来添加页签。它的具体样式需要与
`templates/repo/header.tmpl` 中已有的其他选项卡的样式匹配
([source in GitHub](https://github.com/go-shipyard/shipyard/blob/main/templates/repo/header.tmpl))

### 页面的其他新增内容

除了 `extra_links.tmpl` 和 `extra_tabs.tmpl`，您可以在您的 `custom/templates/custom/` 目录中存放一些其他有用的模板，例如：

- `header.tmpl`，在 `<head>` 标记结束之前的模板，例如添加自定义CSS文件
- `body_outer_pre.tmpl`，在 `<body>` 标记开始处的模板
- `body_inner_pre.tmpl`，在顶部导航栏之前，但在主 container 内部的模板，例如添加一个 `<div class="full height">`
- `body_inner_post.tmpl`，在主 container 结束处的模板
- `body_outer_post.tmpl`，在底部 `<footer>` 元素之前.
- `footer.tmpl`，在 `<body>` 标签结束处的模板，可以在这里填写一些附加的 Javascript 脚本。

## 自定义 gitignores，labels， licenses， locales 以及 readmes

将自定义文件放在 `custom/options` 下相应子的文件夹中即可

## 更改 Shipyard 外观

内置主题是“shipyard-light”、“shipyard-dark”和“shipyard-auto”（自动适应操作系统设置）。

默认主题可以通过 `app.ini` 的 [ui](administration/config-cheat-sheet.md#ui-ui) 部分中的 `DEFAULT_THEME` 进行更改。
