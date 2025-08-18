/**
 * Shipyard Default Configuration
 * This enhanced, refactored config file centralizes all default settings,
 * providing clear sections, better naming, and improved documentation.
 */

const DEFAULT_PAGE_INFO = {
  title: 'Shipyard',
  description: '',
  navLinks: [],
  footerText: '',
};

const DEFAULT_APP_CONFIG = {};

const BUILT_IN_THEMES = [
  'default', 'glass', 'callisto', 'material', 'material-dark', 'shipyard-docs', 'colorful', 'dracula',
  'one-dark', 'lissy', 'cherry-blossom', 'nord-frost', 'nord', 'argon', 'fallout', 'whimsy', 'oblivion',
  'adventure', 'crayola', 'deep-ocean', 'minimal-dark', 'minimal-light', 'thebe', 'matrix', 'matrix-red',
  'color-block', 'raspberry-jam', 'bee', 'tiger', 'glow', 'vaporware', 'cyberpunk', 'material-original',
  'material-dark-original', 'high-contrast-dark', 'high-contrast-light', 'adventure-basic', 'basic', 'tama',
  'neomorphic', 'glass-2', 'night-bat',
];

const SWATCHES = [
  ['#eb5cad', '#985ceb', '#5346f3', '#5c90eb'],
  ['#5cdfeb', '#00CCB4', '#5ceb8d', '#afeb5c'],
  ['#eff961', '#ebb75c', '#eb615c', '#eb2d6c'],
  ['#060913', '#141b33', '#1c2645', '#263256'],
  ['#2b2d42', '#1a535c', '#372424', '#312437'],
  ['#f5f5f5', '#d9d9d9', '#bfbfbf', '#9a9a9a'],
  ['#636363', '#363636', '#313941', '#0d0d0d'],
];

const MAIN_CSS_VARS = ['primary', 'background', 'background-darker'];

const ROUTE_PATHS = {
  home: '/home/:config?/',
  minimal: '/minimal/:config?/',
  workspace: '/workspace/:config?/',
  about: '/about',
  login: '/login',
  download: '/download',
  notFound: '/404',
};

const SERVICE_ENDPOINTS = {
  statusPing: '/status-ping',
  statusCheck: '/status-check',
  save: '/config-manager/save',
  rebuild: '/config-manager/rebuild',
  systemInfo: '/system-info',
  corsProxy: '/cors-proxy',
  getUser: '/get-user',
};

const VISIBLE_COMPONENTS = {
  splashScreen: false,
  navigation: true,
  pageTitle: true,
  searchBar: true,
  settings: true,
  footer: true,
};

const HIDE_FURNITURE_ON = ['minimal', 'login', 'download'];

const LOCAL_STORAGE_KEYS = {
  LANGUAGE: 'language',
  HIDE_INFO_NOTIFICATION: 'hideWelcomeHelpers',
  LAYOUT_ORIENTATION: 'layoutOrientation',
  COLLAPSE_STATE: 'collapseState',
  ICON_SIZE: 'iconSize',
  THEME: 'theme',
  PRIMARY_THEME: 'primaryTheme',
  CUSTOM_COLORS: 'customColors',
  CONF_SECTIONS: 'confSections',
  CONF_PAGES: 'confPages',
  CONF_WIDGETS: 'confWidgets',
  PAGE_INFO: 'pageInfo',
  APP_CONFIG: 'appConfig',
  BACKUP_ID: 'backupId',
  BACKUP_HASH: 'backupHash',
  HIDE_SETTINGS: 'hideSettings',
  USERNAME: 'username',
  MOST_USED: 'mostUsed',
  LAST_USED: 'lastUsed',
  KEYCLOAK_INFO: 'keycloakInfo',
  DISABLE_CRITICAL_WARNING: 'disableCriticalWarning',
};

const COOKIE_KEYS = {
  AUTH_TOKEN: 'shipyardAuthToken',
};

const SESSION_STORAGE_KEYS = {
  SW_STATUS: 'serviceWorkerStatus',
  ERROR_LOG: 'errorLog',
};

const MODAL_NAMES = {
  CONF_EDITOR: 'CONF_EDITOR',
  REBUILD_APP: 'REBUILD_APP',
  ABOUT_APP: 'ABOUT_APP',
  LANG_SWITCHER: 'LANG_SWITCHER',
  EDIT_ITEM: 'EDIT_ITEM',
  EDIT_SECTION: 'EDIT_SECTION',
  EDIT_PAGE_INFO: 'EDIT_PAGE_INFO',
  EDIT_APP_CONFIG: 'EDIT_APP_CONFIG',
  EDIT_MULTI_PAGES: 'EDIT_MULTI_PAGES',
  EXPORT_CONFIG_MENU: 'EXPORT_CONFIG_MENU',
  MOVE_ITEM_TO: 'MOVE_ITEM_TO',
};

const TOP_LEVEL_CONF_KEYS = {
  PAGE_INFO: 'pageInfo',
  APP_CONFIG: 'appConfig',
  SECTIONS: 'sections',
};

const META_TAG_DATA = [
  { name: 'description', content: "A simple static homepage for your server" },
];

const TOASTED_OPTIONS = {
  position: 'bottom-center',
  duration: 2500,
  keepOnHover: true,
  className: 'toast-message',
  iconPack: 'fontawesome',
};

const TOOLTIP_OPTIONS = {
  defaultTrigger: 'hover focus',
  defaultHideOnTargetClick: true,
  autoHide: true,
  defaultHtml: false,
  defaultPlacement: 'auto',
  defaultLoadingContent: 'Loading...',
  defaultDelay: { show: 380, hide: 0 },
};

const FAVICON_API_ENDPOINTS = {
  allesedv: 'https://f1.allesedv.com/128/$URL',
  clearbit: 'https://logo.clearbit.com/$URL',
  iconhorse: 'https://icon.horse/icon/$URL',
  faviconkit: 'https://api.faviconkit.com/$URL/64',
  duckduckgo: 'https://icons.duckduckgo.com/ip2/$URL.ico',
  yandex: 'https://favicon.yandex.net/favicon/$URL',
  google: 'https://www.google.com/s2/favicons?sz=128&domain_url=$URL',
  besticon: 'https://besticon-demo.herokuapp.com/icon?url=$URL&size=80..120..200',
  webmasterapi: 'https://api.webmasterapi.com/v1/favicon/$API_KEY/$URL',
  mcapi: 'https://eu.mc-api.net/v3/server/favicon/$URL',
};

const ICON_CDNS = {
  fa: 'https://kit.fontawesome.com',
  mdi: 'https://cdn.jsdelivr.net/npm/@mdi/font@7.0.96/css/materialdesignicons.min.css',
  si: 'https://unpkg.com/simple-icons@v7/icons',
  sh: 'https://cdn.jsdelivr.net/gh/selfhst/icons@latest/webp/{icon}.webp',
  generative: 'https://api.dicebear.com/7.x/identicon/svg?seed={icon}',
  generativeFallback: 'https://evatar.io/{icon}',
  localPath: './item-icons',
  faviconName: 'favicon.ico',
  homeLabIcons: 'https://raw.githubusercontent.com/walkxcode/dashboard-icons/master/png/{icon}.png',
  homeLabIconsFallback: 'https://raw.githubusercontent.com/NX211/homer-icons/master/png/{icon}.png',
};

const WIDGET_API_ENDPOINTS = {
  anonAddy: 'https://app.addy.io',
  astronomyPictureOfTheDay: 'https://apod.as93.net/apod',
  blacklistCheck: 'https://api.blacklistchecker.com/check',
  codeStats: 'https://codestats.net/',
  covidStats: 'https://disease.sh/v3/covid-19',
  cryptoPrices: 'https://api.coingecko.com/api/v3/coins/',
  cryptoWatchList: 'https://api.coingecko.com/api/v3/coins/markets/',
  cveVulnerabilities: 'https://www.cvedetails.com/json-feed.php',
  domainMonitor: 'https://api.whoapi.com',
  ethGasPrices: 'https://ethgas.watch/api/gas',
  ethGasHistory: 'https://ethgas.watch/api/gas/trend',
  exchangeRates: 'https://v6.exchangerate-api.com/v6/',
  flights: 'https://aerodatabox.p.rapidapi.com/flights/airports/icao/',
  githubTrending: 'https://trend.doforce.xyz/',
  hackernewsTrending: 'https://hacker-news.firebaseio.com/v0',
  healthChecks: 'https://healthchecks.io/api/v1/checks',
  holidays: 'https://kayaposoft.com/enrico/json/v2.0/?action=getHolidaysForDateRange',
  jokes: 'https://v2.jokeapi.dev/joke/',
  news: 'https://api.currentsapi.services/v1/latest-news',
  mullvad: 'https://am.i.mullvad.net/json',
  mvg: 'https://www.mvg.de/api/fib/v2/',
  publicIp: 'https://ipapi.co/json',
  publicIp2: 'https://api.ipgeolocation.io/ipgeo',
  publicIp3: 'https://ip-api.com/json', // verify HTTPS availability or use pro endpoint / server proxy
  publicIp4: 'https://api.ip2location.io/',
  readMeStats: 'https://github-readme-stats.vercel.app/api',
  rescueTime: 'https://www.rescuetime.com/anapi/data',
  rssToJson: 'https://api.rss2json.com/v1/api.json',
  sportsScores: 'https://www.thesportsdb.com/api/v1/json',
  stockPriceChart: 'https://www.alphavantage.co/query',
  tflStatus: 'https://api.tfl.gov.uk/line/mode/dlr,elizabeth-line,overground,tram,tube/status',
  walletBalance: 'https://api.blockcypher.com/v1',
  walletQrCode: 'https://www.bitcoinqrcodemaker.com/api',
  weather: 'https://api.openweathermap.org/data/2.5/weather',
  weatherForecast: 'https://api.openweathermap.org/data/2.5/forecast',
  xkcdComic: 'https://xkcd.vercel.app/',
};

const SEARCH_ENGINE_URLS = {
  duckduckgo: 'https://duckduckgo.com/?q=',
  google: 'https://google.com/search?q=',
  whoogle: 'https://whoogle.sdf.org/search?q=',
  qwant: 'https://www.qwant.com/?q=',
  startpage: 'https://www.startpage.com/do/search?query=',
  'searx-bar': 'https://searx.bar/search?q=',
  'searx-info': 'https://searx.info/search?q=',
  'searx-tiekoetter': 'https://searx.tiekoetter.com/search?q=',
  'searx-bissisoft': 'https://searx.bissisoft.com/search?q=',
  ecosia: 'https://www.ecosia.org/search?q=',
  metager: 'https://metager.org/meta/meta.ger3?eingabe=',
  swisscows: 'https://swisscows.com/web?query=',
  mojeek: 'https://www.mojeek.com/search?q=',
  peekier: 'https://peekier.com/#!',
  wikipedia: 'https://en.wikipedia.org/w/?search=',
  stackoverflow: 'https://stackoverflow.com/search?q=',
  wolframalpha: 'https://www.wolframalpha.com/input/?i=',
  reddit: 'https://www.reddit.com/search/?q=',
  youtube: 'https://youtube.com/results?q=',
  github: 'https://github.com/search?q=',
  bbc: 'https://www.bbc.co.uk/search?q=',
};

const SEARCH_BANGS = {
  '/b': 'bbc',
  '/d': 'duckduckgo',
  '/g': 'google',
  '/r': 'reddit',
  '/w': 'wikipedia',
  '/y': 'youtube',
  '/gh': 'github',
  '/so': 'stackoverflow',
  '/wa': 'wolframalpha',
};

const USER_STATE_ENUM = Object.freeze({
  NOT_CONFIGURED: 0,
  LOGGED_IN: 1,
  GUEST_ACCESS: 2,
  NOT_LOGGED_IN: 3,
  KEYCLOAK_ENABLED: 4,
  OIDC_ENABLED: 5,
});

const PWA_SETTINGS = {
  name: 'Shipyard',
  manifestPath: './manifest.json',
  themeColor: '#00af87',
  msTileColor: '#0b1021',
  mode: 'production',
  manifestCrossorigin: 'use-credentials',
  iconPaths: {
    favicon64: './web-icons/favicon-64x64.png',
    favicon32: './web-icons/favicon-32x32.png',
    favicon16: './web-icons/favicon-16x16.png',
    maskIcon: './web-icons/shipyard-logo.png',
    msTileImage: './web-icons/shipyard-logo.png',
  },
};

module.exports = {
  // General Info
  pageInfo: DEFAULT_PAGE_INFO,
  appConfig: DEFAULT_APP_CONFIG,
  language: 'en',
  startingView: 'default',
  iconSize: 'medium',
  layout: 'auto',
  theme: 'default',

  // External Services
  fontAwesomeKey: '0821c65656',
  faviconApi: 'allesedv',
  faviconApiEndpoints: FAVICON_API_ENDPOINTS,
  iconCdns: ICON_CDNS,

  // Routing & Endpoints
  routePaths: ROUTE_PATHS,
  serviceEndpoints: SERVICE_ENDPOINTS,
  backupEndpoint: 'https://sync-service.ship.khulnasoft.com',

  // UI Customization
  sortOrder: 'default',
  builtInThemes: BUILT_IN_THEMES,
  swatches: SWATCHES,
  mainCssVars: MAIN_CSS_VARS,
  visibleComponents: VISIBLE_COMPONENTS,
  hideFurnitureOn: HIDE_FURNITURE_ON,
  splashScreenTime: 1000,
  metaTagData: META_TAG_DATA,

  // Storage Keys
  localStorageKeys: LOCAL_STORAGE_KEYS,
  cookieKeys: COOKIE_KEYS,
  sessionStorageKeys: SESSION_STORAGE_KEYS,

  // Modal & Conf Keys
  modalNames: MODAL_NAMES,
  topLevelConfKeys: TOP_LEVEL_CONF_KEYS,

  // Notifications & Tooltips
  toastedOptions: TOASTED_OPTIONS,
  tooltipOptions: TOOLTIP_OPTIONS,

  // Widget APIs
  widgetApiEndpoints: WIDGET_API_ENDPOINTS,

  // Search Engine Integrations
  searchEngineUrls: SEARCH_ENGINE_URLS,
  defaultSearchEngine: 'duckduckgo',
  defaultSearchOpeningMethod: 'newtab',
  searchBangs: SEARCH_BANGS,

  // Sentry Error Reporting
  sentryDsn: 'https://aaa4ed4a149337116b76e5207454f839@o4509829959778304.ingest.de.sentry.io/4509839295643728',

  // User Auth State Enum
  userStateEnum: USER_STATE_ENUM,

  // Progressive Web App Config
  pwa: PWA_SETTINGS,
};
