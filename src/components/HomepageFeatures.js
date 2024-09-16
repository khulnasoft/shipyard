import React from 'react';
import './../styles/HomePageFeatures.scss';
import Button from '../components/Button';
import getColor from '../utils/ui-helpers';

import IconAuth from '../../static/icons/features_authentication.svg';
import IconCloudSync from '../../static/icons/features_cloud-sync.svg';
import IconDeploy from '../../static/icons/features_depoloyment.svg';
import IconIconography from '../../static/icons/features_icons.svg';
import IconLayout from '../../static/icons/features_layout-customization.svg';
import IconOpeningMethods from '../../static/icons/features_opening-methods.svg';
import IconShortcuts from '../../static/icons/features_shortcuts.svg';
import IconStatusIndicators from '../../static/icons/features_status-indicators.svg';
import IconThemes from '../../static/icons/features_themes.svg';
import IconUiConfig from '../../static/icons/features_ui-configuration.svg';
import IconLaunching from '../../static/icons/features_launching.svg';
import IconLanguage from '../../static/icons/features_language.svg';
import IconWidgets from '../../static/icons/features_widgets.svg';

const FeatureList = [
  {
    title: 'Theming',
    description: (
      <>
        With tons of built-in themes to choose form, plus a UI color palette editor,
        you can have a unique looking dashboard in no time. There is also support for
        custom CSS, and since all properties use CSS variables, it is easy to override.
      </>
    ),
    link: '/docs/theming',
    icon: (<IconThemes />),
    demo: '/img/homepage-assets/theme-slideshow.gif',
  },
  {
    title: 'Icons',
    description: (
      <>
        Shipyard can auto-fetch icons from the favicon of each of your apps/ services.
        There is also native support for Font Awesome, Material Design Icons, emoji
        icons and of course normal images.
      </>
    ),
    link: '/docs/icons',
    icon: (<IconIconography />),
  },
  {
    title: 'Status Indicators',
    description: (
      <>
        Get an instant overview of the health of each of your apps with status indicators.
        Once enabled, a small dot next to each app will show weather it is up and online,
        with more info like response time visible on hover.
      </>
    ),
    link: '/docs/status-indicators',
    icon: (<IconStatusIndicators />),
    demo: '/img/homepage-assets/status-check-demo.gif',
  },
  {
    title: 'Authentication',
    description: (
      <>
        Need to protect your dashboard, the simple auth feature is super quick to enable,
        and has support for multiple users with granular controls. Shipyard also has built-in
        support for Keycloak and other SSO providers.
      </>
    ),
    link: '/docs/authentication',
    icon: (<IconAuth />),
  },
  {
    title: 'Widgets',
    description: (
      <>
        Display dynamic content from any API-enabled service. Shipyard comes bundled with 50+
        pre-built widgets for self-hosted services, productivity and monitoring.
      </>
    ),
    link: '/docs/widgets',
    icon: (<IconWidgets />),
    demo: 'https://i.ibb.co/GFjXVHy/shipyard-widgets.png',
  },
  {
    title: 'Alternate Views',
    description: (
      <>
        As well as the default home, there is also a minimal view, which makes a great
        fast-loading browser startpage. Plus a workspace view useful for working on
        multiple apps at once, all without having to leave your dashboard.
      </>
    ),
    link: '/docs/alternate-views',
    icon: (<IconOpeningMethods />),
    demo: '/img/homepage-assets/workspace-demo.gif',
  },
  {
    title: 'Launching Methods',
    description: (
      <>
        Choose how to launch each of your apps by default, or right click for all options.
        Apps can be opened in a new tab, the same tab, a quick pop-up modal or in the
        workspace view.
      </>
    ),
    link: '/docs/alternate-views',
    icon: (<IconLaunching />),
  },
  {
    title: 'Search & Shortcuts',
    description: (
      <>
        To search, just start typing, results will be filtered instantly. Use the
        arrow keys or tab to navigate through results, and press enter to launch.
        You can also create custom shortcuts for frequently used apps, or add
        custom tags for easier searching. Shipyard can also be used to search the web
        using your favorite search engine.
      </>
    ),
    link: '/docs/searching',
    icon: (<IconShortcuts />),
    demo: '/img/homepage-assets/searching-demo.gif',
  },
  {
    title: 'Cloud Backup & Sync',
    description: (
      <>
        There is an optional, end-to-end encrypted, free backup cloud service.
        This enables you to have your config backed up off-site, and to sync
        data between multiple instances easily.
      </>
    ),
    link: '/docs/backup-restore',
    icon: (<IconCloudSync />),
  },
  {
    title: 'Configuration',
    description: (
      <>
        Shipyard's config is specified in a simple YAML file. But you can also configure
        the directly through the UI, and have changes written to, and backed up on disk.
        Real-time validation and hints are in place to help you.
      </>
    ),
    link: '/docs/configuring',
    icon: (<IconUiConfig />),
    demo: '/img/homepage-assets/config-editor-demo.gif',
  },
  {
    title: 'Multi-Language Support',
    description: (
      <>
        Shipyard's UI has been translated into several languages by several amazing contributors.
        Currently English, German, French, Dutch and Slovenian are supported.
        Your language should be applied automatically, or you can change it in the config menu.
      </>
    ),
    link: '/docs/multi-language-support',
    icon: (<IconLanguage />),
  },
  {
    title: 'Easy Deployment',
    description: (
      <>
        Although Shipyard can be easily run on bare metal, the quickest method of getting started is with Docker.
        Just run `docker run -p 8080:80 khulnasoft/shipyard` to pull, build and and run Shipyard.
      </>
    ),
    link: '/docs/quick-start',
    icon: (<IconDeploy />),
  },
  {
    title: 'Customizable Layouts',
    description: (
      <>
        Structure your dashboard to fit your use case. From the UI, you can choose between
        different layouts, item sizes, show/ hide components, switch themes plus more.

        You can customize pretty much every area of your dashboard. There are config
        options for custom header, footer, nav bar links, title etc. You can also
        choose to hide any elements you don't need.
      </>
    ),
    link: '/docs/',
    icon: (<IconLayout />),
  },
];

function Feature({ title, description, icon, demo, index, link }) {
  const side = index % 2 == 0 ? 'left' : 'right';
  const color = getColor(index)
  return (
    <div className={`feature align-${side} color-${color}`}>
      <div className="feature-half text">
        <div className="feature-title">{icon}<h3>{title}</h3></div>
        {description}
        <div className="read-the-docs">
          <small>Learn more in the Docs</small>
          <Button to={link} color={color}>{icon} Docs</Button>
        </div>
      </div>
      <div className="feature-half assets">
        {demo
          ? <img className="demo" src={demo} />
          : <span className="not-demo">Screenshot Coming Soon</span>
        }
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className="home-page-features-wrapper" id="features-wrap">
      {FeatureList.map((props, index) => (
        <Feature key={index} index={index} {...props} />
      ))}
    </section>
  );
}
