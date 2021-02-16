const path = require('path')

module.exports = {
  apps: [
    {
      name: 'ihaowu-passport',
      cwd: path.join(__dirname, 'ihaowu-passport'),
      script: 'apps/api/dist/main.js',
      instances: 1,
      autorestart: true,
      max_memory_restart: '120M',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
