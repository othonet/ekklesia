// Configuração do PM2 para a aplicação Ekklesia
module.exports = {
  apps: [
    {
      name: 'ekklesia',
      script: 'npm',
      args: 'start',
      cwd: '/root/ekklesia',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      error_file: '/root/ekklesia/logs/pm2-error.log',
      out_file: '/root/ekklesia/logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.next'],
    },
  ],
};

