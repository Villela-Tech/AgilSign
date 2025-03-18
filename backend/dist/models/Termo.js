"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const uuid_1 = require("uuid");
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
            return '';
        }
    },
    assinatura: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    }
}, {
    sequelize: database_1.default,
    tableName: 'termos',
});
exports.default = Termo;
