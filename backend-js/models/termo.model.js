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
    numeroSerie: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'numeroSerie'
    },
    patrimonio: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'patrimonio'
    },
    responsavelId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'responsavelId'
    },
    status: {
      type: DataTypes.ENUM('pendente', 'assinado', 'cancelado'),
      defaultValue: 'pendente',
    },
    urlAcesso: {
      type: DataTypes.STRING,
      unique: true,
      field: 'url_acesso'
    },
    assinatura: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  },
  {
    sequelize,
    tableName: 'termos',
    timestamps: true,
    underscored: true 
  }
);

module.exports = Termo;
