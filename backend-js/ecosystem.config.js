module.exports = {
  apps: [
    {
      name: "agilsign-api",
      script: "./server.js",
      watch: false,
      instances: 1,
      exec_mode: "fork",
      env_production: {
        NODE_ENV: "production",
        PORT: "443",
        HOST: "0.0.0.0"
      },
      error_file: "/home/administrador/logs/pm2/err.log",
      out_file: "/home/administrador/logs/pm2/out.log",
      log_file: "/home/administrador/logs/pm2/combined.log",
      time: true
    }
  ]
}