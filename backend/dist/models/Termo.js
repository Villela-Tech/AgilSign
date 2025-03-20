"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const uuid_1 = require("uuid");
const user_model_1 = __importDefault(require("./user.model"));
class Termo extends sequelize_1.Model {
}
Termo.init({
    id: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: () => (0, uuid_1.v4)(),
        primaryKey: true,
    },
    nome: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    sobrenome: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    equipamento: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        defaultValue: 'pendente',
        allowNull: false,
    },
    urlAcesso: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: function () {
            // Será substituído pelo controlador
            return '';
        }
    },
    assinatura: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: user_model_1.default,
            key: 'id'
        }
    }
}, {
    sequelize: database_1.default,
    tableName: 'termos',
});
// Definir relacionamento com User
Termo.belongsTo(user_model_1.default, { foreignKey: 'userId' });
exports.default = Termo;
