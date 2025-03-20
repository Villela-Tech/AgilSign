module.exports = {
  apps: [{
    name: 'agilsign-backend',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DB_HOST: '15.235.9.156',
      DB_USER: 'ville5113_ville5113',
      DB_PASSWORD: 'Qi7dayP8jzg@KZY',
      DB_NAME: 'ville5113_agilsign',
      DB_PORT: 3306,
      JWT_SECRET: 'AgilSign@2024#SecureToken$JWT!SecretKey'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      DB_HOST: '15.235.9.156',
      DB_USER: 'ville5113_ville5113',
      DB_PASSWORD: 'Qi7dayP8jzg@KZY',
      DB_NAME: 'ville5113_agilsign',
      DB_PORT: 3306,
      JWT_SECRET: 'AgilSign@2024#SecureToken$JWT!SecretKey'
    }
  }]
} 