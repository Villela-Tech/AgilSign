const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Termo extends Model {}

Termo.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sobrenome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    equipamento: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pendente', 'assinado', 'cancelado'),
      defaultValue: 'pendente',
    },
  },
  {
    sequelize,
    tableName: 'termos',
    timestamps: true,
  }
);

module.exports = Termo;
