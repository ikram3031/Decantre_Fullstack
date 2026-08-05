import coreConfig from './config.core.json';

let clientConfig = {};
try {
  clientConfig = require('./config.client.json');
} catch (e) {
  // Fallback if client config doesn't exist
}

export const config = {
  ...coreConfig,
  ...clientConfig
};

export default config;
