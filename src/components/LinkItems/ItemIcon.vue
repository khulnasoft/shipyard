/**
 * Main application entry point.
 * - Runs startup checks
 * - Serves the app from ./dist
 * - Imports routes for status, config, system info, etc.
 * - Requires prior build (yarn build)
 */

/* Built-in Node modules */
const fs = require('fs');
const os = require('os');
const dns = require('dns');
const http = require('http');
const path = require('path');
const util = require('util');
const crypto = require('crypto');

/* NPM dependencies */
const yaml = require('js-yaml');
const RateLimit = require('express-rate-limit');

/* Express & middleware */
const express = require('express');
const basicAuth = require('express-basic-auth');
const history = require('connect-history-api-fallback');

/* App services/routes */
require('./services/update-checker'); // Prints update info on startup
const configValidator = require('./services/config-validator');
const statusCheck = require('./services/status-check');
const saveConfig = require('./services/save-config');
const rebuild = require('./services/rebuild-app');
const systemInfo = require('./services/system-info');
const sslServer = require('./services/ssl-server');
const corsProxy = require('./services/cors-proxy');
const getUser = require('./services/get-user');
const printMessage = require('./services/print-message');
const { serviceEndpoints: ENDPOINTS } = require('./src/utils/defaults');

/* Environment, config, and network setup */
const isDocker = Boolean(process.env.IS_DOCKER);
const port = process.env.PORT || (isDocker ? 8080 : 4000);
const host = process.env.HOST || '0.0.0.0';
process.env.IS_SERVER = 'True';

let config = configValidator;

/* Utility: get local IP for welcome message */
const getLocalIp = async () => {
  try {
    const dnsLookup = util.promisify(dns.lookup);
    const { address } = await dnsLookup(os.hostname());
    return address || 'localhost';
  } catch {
    return 'localhost';
  }
};

/* Print welcome message with detected IP/host */
const printWelcomeMessage = async () => {
  try {
    const ip = process.env.HOST || await getLocalIp();
    console.log(printMessage(ip, port, isDocker));
  } catch {
    console.log(`Shipyard server has started (${port})`);
  }
};

/* Consistent warning output */
const printWarning = (msg, error) => {
  console.warn(`\x1b[103m\x1b[34m${msg}\x1b[0m\n`, error || '');
};

/* Load appConfig.auth.users from config file for HTTP auth */
function loadUserConfig() {
  try {
    const filePath = path.join(__dirname, process.env.USER_DATA_DIR || 'user-data', 'conf.yml');
    const data = yaml.load(fs.readFileSync(filePath, 'utf8'));
    return data?.appConfig?.auth?.users || [];
  } catch {
    return [];
  }
}

/* Custom basic auth logic for HTTP auth */
function customAuthorizer(username, password) {
  const sha256 = input => crypto.createHash('sha256').update(input).digest('hex').toUpperCase();
  const generateUserToken = user => {
    if (!user.user || (!user.hash && !user.password)) return '';
    const passwordHash = user.hash || sha256(process.env[user.password]);
    return sha256(user.user.toUpperCase() + passwordHash.toUpperCase());
  };
  const users = loadUserConfig();
  if (password.startsWith('Bearer ')) {
    const token = password.slice('Bearer '.length);
    return users.some(user => generateUserToken(user) === token);
  } else {
    const userHash = sha256(password);
    return users.some(user =>
      user.user.toLowerCase() === username.toLowerCase() &&
      user.hash.toUpperCase() === userHash
    );
  }
}

/* Basic auth middleware setup */
function getBasicAuthMiddleware() {
  const configUsers = process.env.ENABLE_HTTP_AUTH ? loadUserConfig() : null;
  const { BASIC_AUTH_USERNAME, BASIC_AUTH_PASSWORD } = process.env;
  if (BASIC_AUTH_USERNAME && BASIC_AUTH_PASSWORD) {
    return basicAuth({
      users: { [BASIC_AUTH_USERNAME]: BASIC_AUTH_PASSWORD },
      challenge: true,
      unauthorizedResponse: () => 'Unauthorized - Incorrect username or password',
    });
  } else if (Array.isArray(configUsers) && configUsers.length > 0) {
    return basicAuth({
      authorizer: customAuthorizer,
      challenge: true,
      unauthorizedResponse: () => 'Unauthorized - Incorrect token',
    });
  } else {
    // No auth required
    return (req, res, next) => next();
  }
}

const protectConfig = getBasicAuthMiddleware();

/* Helper: restrict HTTP method for a route */
const method = (targetMethod, mw) => (req, res, next) =>
  req.method === targetMethod ? mw(req, res, next) : next();

/* Rate limiting: 100 requests/15min window */
const limiter = RateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  skip: () => process.env.NODE_ENV === 'development',
});

/* Express app setup */
const app = express()
  .use(limiter)
  .use(sslServer.middleware)
  .use(express.json({ limit: '1mb' }))
  // Status check endpoint
  .use(ENDPOINTS.statusCheck, (req, res) => {
    statusCheck(req.url, async results => res.end(results));
  })
  // Save config endpoint
  .use(ENDPOINTS.save, method('POST', (req, res) => {
    try {
      saveConfig(req.body, results => res.end(results));
      config = req.body.config;
    } catch (e) {
      printWarning('Error writing config file to disk', e);
      res.end(JSON.stringify({ success: false, message: e }));
    }
  }))
  // Rebuild app endpoint
  .use(ENDPOINTS.rebuild, (req, res) => {
    rebuild()
      .then(response => res.end(JSON.stringify(response)))
      .catch(response => res.end(JSON.stringify(response)));
  })
  // System info endpoint
  .use(ENDPOINTS.systemInfo, (req, res) => {
    try {
      const results = systemInfo();
      res.end(JSON.stringify({ ...results, success: true }));
    } catch (e) {
      res.end(JSON.stringify({ success: false, message: e }));
    }
  })
  // CORS proxy endpoint
  .use(ENDPOINTS.corsProxy, (req, res) => {
    try {
      corsProxy(req, res);
    } catch (e) {
      res.end(JSON.stringify({ success: false, message: e }));
    }
  })
  // Get user info endpoint
  .use(ENDPOINTS.getUser, (req, res) => {
    try {
      const user = getUser(config, req);
      res.end(JSON.stringify(user));
    } catch (e) {
      res.end(JSON.stringify({ success: false, message: e }));
    }
  })
  // Serve .yml files with optional protection
  .get('/*.yml', protectConfig, (req, res) => {
    const ymlFile = path.basename(req.path); // Sanitize to prevent path traversal
    const userDataDir = path.resolve(__dirname, process.env.USER_DATA_DIR || 'user-data');
    const filePath = path.join(userDataDir, ymlFile);
    
    // Ensure the resolved path is within the user-data directory
    if (!filePath.startsWith(userDataDir)) {
      return res.status(403).send('Access denied');
    }
    
    res.sendFile(filePath);
  })
  // Serve static files (user-data, dist, public)
  .use(express.static(path.join(__dirname, process.env.USER_DATA_DIR || 'user-data')))
  .use(express.static(path.join(__dirname, 'dist')))
  .use(express.static(path.join(__dirname, 'public'), { index: 'initialization.html' }))
  .use(history())
  // Default: serve index.html for unmatched routes
  .use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'dist', 'index.html'));
  });

/* Start HTTP server */
http.createServer(app)
  .listen(port, host, () => printWelcomeMessage())
  .on('error', err => printWarning('Unable to start Shipyard\'s Node server', err));

/* Start SSL server (if possible) */
sslServer.startSSLServer(app);
