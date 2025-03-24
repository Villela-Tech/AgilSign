const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT || 'mysql',
        logging: process.env.NODE_ENV === 'production' ? false : console.log,
        define: {
            timestamps: true,
            underscored: true
        },
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// Testar a conexão
sequelize
    .authenticate()
    .then(() => {
        console.log('Conexão com o banco de dados estabelecida com sucesso.');
    })
    .catch(err => {
        console.error('Erro ao conectar com o banco de dados:', err);
    });

module.exports = sequelize;