module.exports = {
  apps : [{
    name: 'list-3366',
    script: 'http-server',
    args: './dist -p 3366',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '256M',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
