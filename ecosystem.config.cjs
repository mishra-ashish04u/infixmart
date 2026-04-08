// PM2 ecosystem config for Hostinger Node.js hosting
// Hostinger runs your app via PM2 — this file controls how.

module.exports = {
  apps: [
    {
      name: "infixmart",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "./",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
    },
  ],
};
