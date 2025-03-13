import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { v4 as uuidv4 } from 'uuid';

interface TermoAttributes {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  equipamento: string;
  status: 'pendente' | 'assinado';
  urlAcesso: string;
  assinatura?: string;
}

class Termo extends Model<TermoAttributes> implements TermoAttributes {
  public id!: string;
  public nome!: string;
  public sobrenome!: string;
  public email!: string;
  public equipamento!: string;
  public status!: 'pendente' | 'assinado';
  public urlAcesso!: string;
  public assinatura!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Termo.init(
  {
    id: {
      type: DataTypes.STRING,
      defaultValue: () => uuidv4(),
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
    },
    equipamento: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pendente',
      allowNull: false,
    },
    urlAcesso: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: function() {
        // Será substituído pelo controlador
        return '';
      }
    },
    assinatura: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'termos',
  }
);

export default Termo; 