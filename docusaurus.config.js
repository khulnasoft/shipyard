const darkCodeTheme = require('prism-react-renderer/themes/dracula');
const lightCodeTheme = require('prism-react-renderer/themes/github');

/* External URLs */
const externalUrl = {
  editUrl: 'https://github.com/khulnasoft/shipyard/edit/gh-pages/docs/',
  licenseUrl: 'https://github.com/khulnasoft/shipyard/blob/master/LICENSE',
  aliciaUrl: 'https://aliciasykes.com',
  shipyardUrl: 'https://ship.khulnasoft.com',
};

const footerText = `<a href="${externalUrl.shipyardUrl}">Shipyard</a> - The Self-Hosted Dashboard for your Homelab`
  + `<br />License under <a href="${externalUrl.licenseUrl}">MIT</a>. `
  + `Copyright © ${new Date().getFullYear()} <a href="${externalUrl.aliciaUrl}">Alicia Sykes</a>`;

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'Shipyard',
  tagline: 'The Ultimate Homepage for your Homelab',
  url: externalUrl.shipyardUrl,
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'khulnasoft', // Usually your GitHub org/user name.
  projectName: 'shipyard', // Usually your repo name.
  plugins: ['docusaurus-plugin-sass'],
  themeConfig: {
    // Dark & Light Mode
    colorMode: {
      defaultMode: 'dark',
      switchConfig: {
        darkIcon: '🌙',
        lightIcon: '☀️',
      },
    },
    // Algolia Web Search
    algolia: {
      apiKey: '97d967bd42096f2c69f015214ff36176',
      indexName: 'main',
      // contextualSearch: true,
      // appId: '9NYB4LE3DS',
      // searchParameters: {},
    },
    // Prism Code Highlighting
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
    },
    // Top Navigation Bar
    navbar: {
      title: 'Shipyard',
      logo: {
        alt: 'Shipyard Logo',
        src: 'img/shipyard.png',
      },
      items: [
        { label: 'GitHub', to: 'https://github.com/khulnasoft/shipyard' },
        { label: 'Live Demo', to: 'https://demo.ship.khulnasoft.com' },
        { label: 'Quick Start', to: '/docs/quick-start' },
        { label: 'Documentation', to: '/docs' },
      ],
    },
    // Page Footer Links
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Intro',
          items: [
            { label: 'GitHub', to: 'https://github.com/khulnasoft/shipyard' },
            { label: 'Live Demo', to: 'https://demo.ship.khulnasoft.com' },
            { label: 'Quick Start', to: '/docs/quick-start' },
            { label: 'Documentation', to: '/docs' },
          ],
        },
        {
          title: 'Setup Guide',
          items: [
            { label: 'Deploying', to: '/docs/deployment' },
            { label: 'Configuring', to: '/docs/configuring' },
            { label: 'Management', to: '/docs/management' },
            { label: 'Troubleshooting', to: '/docs/troubleshooting' },
          ],
        },
        {
          title: 'Feature Docs Pt 1',
          items: [
            { label: 'Authentication', to: '/docs/authentication' },
            { label: 'Alternate Views', to: '/docs/alternate-views' },
            { label: 'Backup & Restore', to: '/docs/backup-restore' },
            { label: 'Icons', to: '/docs/icons' },
          ],
        },
        {
          title: 'Feature Docs Pt 2',
          items: [
            { label: 'Language Switching', to: '/docs/multi-language-support' },
            { label: 'Status Indicators', to: '/docs/status-indicators' },
            { label: 'Searching  & Shortcuts', to: '/docs/searching' },
            { label: 'Theming', to: '/docs/theming' },
          ],
        },
        {
          title: 'Community',
          items: [
            { label: 'Developing', to: '/docs/developing' },
            { label: 'Development Guides', to: '/docs/development-guides' },
            { label: 'Contributing', to: '/docs/contributing' },
            { label: 'Showcase', to: '/docs/showcase' },
            { label: 'Credits', to: '/docs/credits' },
          ],
        },
        {
          title: 'Misc',
          items: [
            { label: 'Privacy & Security', to: '/docs/privacy' },
            { label: 'License', to: '/docs/license' },
            { label: 'Legal', to: 'https://github.com/khulnasoft/shipyard/blob/master/.github/LEGAL.md' },
            { label: 'Code of Conduct', to: '/docs/code-of-conduct' },
            { label: 'Changelog', to: '/docs/changelog' },
          ],
        },
      ],
      copyright: footerText,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: externalUrl.editUrl,
        },
        theme: {
          customCss: [
            require.resolve('./src/styles/Colors.scss'),
            require.resolve('./src/styles/Typography.scss'),
            require.resolve('./src/styles/custom.scss'),
          ]
        },
      },
    ],
  ],
  scripts: [
    // Plausible Analytics (no tracking, just hit counter, using self-hosted Plausible)
    {src: 'https://no-track.as93.net/js/script.js', defer: true, 'data-domain': 'ship.khulnasoft.com'},
  ],
};
