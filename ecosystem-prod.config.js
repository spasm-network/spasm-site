require('dotenv').config();

module.exports = {
  apps : [{
    name: process.env.FRONTEND_PM2_PROD_NAME || 'spasm-site-3366',
    script: 'http-server',
    args: `./dist -p ${process.env.FRONTEND_PROD_PORT || 3366}`,
    exec_mode: process.env.FRONTEND_PM2_PROD_EXEC_MODE || 'cluster',
    instances: process.env.FRONTEND_PM2_PROD_INSTANCES || 1,
    autorestart: true,
    watch: false,
    max_memory_restart: process.env.FRONTEND_PM2_PROD_MAX_MEMORY_RESTART || '256M',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
