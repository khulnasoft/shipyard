<h1 align="center">Shipyard</h1>
<p align="center">
  <i>Shipyard helps you organize your self-hosted services by making them accessible from a single place</i>
   <br/>
  <img width="120" src="https://i.ibb.co/yhbt6CY/shipyard.png" />
  <br/>
  <b><a href="https://github.com/khulnaSoft/shipyard/blob/master/docs/showcase.md">User Showcase</a></b> | <b><a href="https://demo.ship.khulnasoft.com">Live Demo</a></b> | <b><a href="https://github.com/khulnaSoft/shipyard/blob/master/docs/quick-start.md">Getting Started</a></b> | <b><a href="https://ship.khulnasoft.com/docs">Documentation</a></b> | <b><a href="https://github.com/khulnaSoft/shipyard">GitHub</a></b>
  <br/><br/>
  <a href="https://github.com/awesome-selfhosted/awesome-selfhosted#personal-dashboards">
    <img src="https://cdn.rawgit.com/sindresorhus/awesome/d7305f38d29fed78fa85652e3a63e154dd8e8829/media/badge.svg" alt="Awesome Self-Hosted">
  </a>
  <a href="https://github.com/khulnaSoft/shipyard/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-0aa8d2?logo=opensourceinitiative&logoColor=fff" alt="License MIT">
  </a>
  <a href="https://github.com/khulnaSoft/shipyard/blob/master/.github/CHANGELOG.md">
    <img src="https://img.shields.io/github/package-json/v/khulnasoft/shipyard?logo=azurepipelines&amp;color=0aa8d2" alt="Current Version">
  </a>
  <a href="https://hub.docker.com/r/khulnasoft/shipyard">
    <img src="https://img.shields.io/docker/pulls/khulnasoft/shipyard?logo=docker&color=0aa8d2&logoColor=fff" alt="Docker Pulls">
  </a>
  <a href="http://as93.link/shipyard-build-status">
   <img src="https://badgen.net/github/status/khulnasoft/shipyard?icon=github" alt="GitHub Status">
  </a>
  <a href="https://snyk.io/test/github/khulnasoft/shipyard">
    <img src="https://snyk.io/test/github/khulnasoft/shipyard/badge.svg" alt="Known Vulnerabilities">
  </a>
</p>

## Features 🌈

- 🔎 Instant search by name, domain, or tags + customizable hotkeys & keyboard shortcuts
- 🎨 Multiple built-in color themes, with UI color editor and support for custom CSS
- 🧸 Many icon options - Font-Awesome, homelab icons, auto-fetching Favicon, images, emojis, etc.
- 🚦 Status monitoring for each of your apps/links for basic availability and uptime checking
- 📊 Widgets for displaying info and dynamic content from your self-hosted services
- 💂 Optional authentication with multi-user access, configurable privileges, and SSO support
- 🌎 Multi-language support, with 10+ human-translated languages, and more on the way
- ☁ Optional, encrypted, free off-site cloud backup and restore feature available
- 💼 A workspace view, for easily switching between multiple apps simultaneously
- 🛩️ A minimal view, for use as a fast-loading browser Startpage
- 🖱️ Choose app launch method, either new tab, same tab, a pop-up modal, or in the workspace view
- 📏 Customizable layout, sizes, text, component visibility, sort order, behavior, etc.
- 🖼️ Options for a full-screen background image, custom nav-bar links, HTML footer, title, etc.
- 🚀 Easy to setup with Docker, or on bare metal, or with 1-Click cloud deployment
- ⚙️ Easy configuration, either through the UI, or using a YAML file
- ✨ Under active development with improvements and new features added regularly 
- 🤏 Small bundle size, fully responsive UI, and PWA for basic offline access
- 🆓 100% free and open-source
- 🔐 Strong focus on privacy
- 🌈 And loads more...

## Demo ⚡

**Live Instances**: [Demo 1](https://demo.ship.khulnasoft.com) (Live Demo) ┆ [Demo 2](https://live.ship.khulnasoft.com) (Shipyard Links) ┆ [Demo 3](https://dev.ship.khulnasoft.com) (Dev Preview)

**Screenshots**: Checkout the [Showcase](https://github.com/khulnaSoft/shipyard/blob/master/docs/showcase.md), to see example dashboards from the community

**Spin up your own demo**: [![One-Click Deploy with PWD](https://img.shields.io/badge/Play--with--Docker-Deploy-2496ed?style=flat-square&logo=docker)](https://labs.play-with-docker.com/?stack=https://raw.githubusercontent.com/khulnaSoft/shipyard/master/docker-compose.yml) or [`docker run -p 8080:8080 khulnasoft/shipyard`](./docs/quick-start.md)


<p align="center">
  <img width="800" src="https://i.ibb.co/L8YbNNc/shipyard-demo2.gif" alt="Demo" />
</p>


**[⬆️ Back to Top](#shipyard)**

---

## Getting Started 🛫

To deploy Shipyard with Docker, just run `docker run -p 8080:8080 khulnasoft/shipyard`, then open `http://localhost:8080`

For full list of options and a Docker compose file, see the [Deployment Docs](https://github.com/khulnaSoft/shipyard/blob/master/docs/deployment.md).

Shipyard can also be run on bare metal using Node.js, or deployed to a cloud service, using the 1-Click deploy script.

---

## Documentation 📝

#### Running Shipyard
- **[Quick Start](https://github.com/khulnaSoft/shipyard/blob/master/docs/quick-start.md)** - TDLR guide on getting Shipyard up and running
- **[Deployment](https://github.com/khulnaSoft/shipyard/blob/master/docs/deployment.md)** - Full guide on deploying Shipyard either locally or online
- **[Configuring](https://github.com/khulnaSoft/shipyard/blob/master/docs/configuring.md)** - Complete list of all available options in the config file
- **[App Management](https://github.com/khulnaSoft/shipyard/blob/master/docs/management.md)** - Managing your app, updating, security, web server configuration, etc
- **[Troubleshooting](https://github.com/khulnaSoft/shipyard/blob/master/docs/troubleshooting.md)** - Common errors and problems, and how to fix them

#### Feature Docs
- **[Authentication](https://github.com/khulnaSoft/shipyard/blob/master/docs/authentication.md)** - Guide to setting up authentication to protect your dashboard
- **[Alternate Views](https://github.com/khulnaSoft/shipyard/blob/master/docs/alternate-views.md)** - Outline of available pages / views and item opening methods
- **[Backup & Restore](https://github.com/khulnaSoft/shipyard/blob/master/docs/backup-restore.md)** - Guide to backing up config with Shipyard's cloud sync feature
- **[Icons](https://github.com/khulnaSoft/shipyard/blob/master/docs/icons.md)** - Outline of all available icon types for sections and items, with examples
- **[Language Switching](https://github.com/khulnaSoft/shipyard/blob/master/docs/multi-language-support.md)** - Details on how to switch language, or add a new locale
- **[Status Indicators](https://github.com/khulnaSoft/shipyard/blob/master/docs/status-indicators.md)** - Using Shipyard to monitor uptime and status of your apps
- **[Searching  & Shortcuts](https://github.com/khulnaSoft/shipyard/blob/master/docs/searching.md)** - Searching, launching methods + keyboard shortcuts
- **[Theming](https://github.com/khulnaSoft/shipyard/blob/master/docs/theming.md)** - Complete guide to applying, writing and modifying themes + styles
- **[Widgets](https://github.com/khulnaSoft/shipyard/blob/master/docs/widgets.md)** - List of all dynamic content widgets, with usage guides and examples

#### Development and Contributing 
- **[Developing](https://github.com/khulnaSoft/shipyard/blob/master/docs/developing.md)** - Running Shipyard development server locally, and general workflow
- **[Development Guides](https://github.com/khulnaSoft/shipyard/blob/master/docs/development-guides.md)** - Common development tasks, to help new contributors
- **[Contributing](https://github.com/khulnaSoft/shipyard/blob/master/docs/contributing.md)** - How you can help keep Shipyard alive
- **[Showcase](https://github.com/khulnaSoft/shipyard/blob/master/docs/showcase.md)** - See how others are using Shipyard, and share your dashboard
- **[Credits](https://github.com/khulnaSoft/shipyard/blob/master/docs/credits.md)** - List of people and projects that have made Shipyard possible
- **[Release Workflow](https://github.com/khulnaSoft/shipyard/blob/master/docs/release-workflow.md)** - Info about releases, CI and automated tasks

---

## License 📜

Shipyard is Licensed under [MIT X11](https://en.wikipedia.org/wiki/MIT_License)

```
Copyright © 2024 KhulnaSoft Ltd <https://khulnasoft.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this
software and associated documentation files (the "Software"), to deal in the Software
without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or
substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF, OR IN CONNECTION WITH THE SOFTWARE OR THE USE
OR OTHER DEALINGS IN THE SOFTWARE.

Except as contained in this notice, Shipyard shall not be used in advertising or otherwise
to promote the sale, use, or other dealings in this Software without prior written
authorization from the repo owner.
```
