import fs from 'fs';

const mode = process.argv[2] || 'dev';

const configs = {
  dev: {
    VITE_API_URL: 'https://server.decantrebd.com',
    VITE_IMAGE_BASE_URL: 'https://server.decantrebd.com',
  },
  live: {
    VITE_API_URL: 'https://service.decantrebd.com',
    VITE_IMAGE_BASE_URL: 'https://service.decantrebd.com',
  },
  local: {
    VITE_API_URL: 'http://localhost:8005',
    VITE_IMAGE_BASE_URL: 'http://localhost:8005',
  },
};

const selected = configs[mode] || configs.dev;

const content = `VITE_API_URL=${selected.VITE_API_URL}\nVITE_IMAGE_BASE_URL=${selected.VITE_IMAGE_BASE_URL}\n`;

fs.writeFileSync('.env', content, 'utf8');
console.log(`\x1b[32m[ENV Switcher]\x1b[0m Switched .env to \x1b[33m${mode.toUpperCase()}\x1b[0m (${selected.VITE_API_URL})`);
