const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
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
        },
        dialectOptions: {
            connectTimeout: 60000,
            // SSL configuration if needed
            // ssl: {
            //     require: true,
            //     rejectUnauthorized: false
            // }
        }
    }
);

module.exports = sequelize; 