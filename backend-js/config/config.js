require('dotenv').config();

const BASE_URL = 'apiagilsign.villelatech.com.br';
const PORT = process.env.PORT || 80;

module.exports = {
  // URL base da aplicação
  BASE_URL,
  PORT,

  // URL completa com porta
  API_URL: `http://${BASE_URL}`,

  // Configurações do banco de dados
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },

  // JWT Secret
  jwtSecret: process.env.JWT_SECRET,

  // Ambiente
  nodeEnv: process.env.NODE_ENV || 'development',

  // Gerar URL completa
  getFullUrl: function(path) {
    return `${this.API_URL}${path}`;
  }
}; 