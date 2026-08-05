'use strict';

const path = require('path');

const ROOT = __dirname;
const ADMIN_SERVER = path.join(ROOT, '..', 'x-bilsenter-admin', 'server');

module.exports = {
  apps: [
    {
      name: 'xbilsenter-site',
      cwd: ROOT,
      script: 'server/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 8080,
      },
      autorestart: true,
      max_restarts: 100,
      min_uptime: '10s',
      restart_delay: 4000,
      max_memory_restart: '450M',
      error_file: path.join(ROOT, 'logs', 'site-error.log'),
      out_file: path.join(ROOT, 'logs', 'site-out.log'),
      merge_logs: true,
      time: true,
    },
    {
      name: 'xbilsenter-admin',
      cwd: ADMIN_SERVER,
      script: 'index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 8090,
      },
      autorestart: true,
      max_restarts: 100,
      min_uptime: '10s',
      restart_delay: 4000,
      max_memory_restart: '600M',
      error_file: path.join(ROOT, 'logs', 'admin-error.log'),
      out_file: path.join(ROOT, 'logs', 'admin-out.log'),
      merge_logs: true,
      time: true,
    },
  ],
};
