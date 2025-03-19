"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const termo_routes_1 = __importDefault(require("./routes/termo.routes"));
const user_model_1 = __importDefault(require("./models/user.model"));
const auth_middleware_1 = require("./middleware/auth.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://ville5113.c44.integrator.host';
// Middlewares
app.use((0, cors_1.default)({
    origin: FRONTEND_URL,
    credentials: true
}));
app.use(express_1.default.json());
// Rotas
app.use('/api/auth', auth_routes_1.default);
app.use('/api/termos', auth_middleware_1.authMiddleware, termo_routes_1.default);
// Status da aplicação
app.get('/status', (req, res) => {
    res.status(200).json({ status: 'online', environment: process.env.NODE_ENV });
});
function createAdminUser() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const adminUser = yield user_model_1.default.findOne({ where: { email: 'admin@agilsign.com' } });
            if (!adminUser) {
                yield user_model_1.default.create({
                    name: 'Admin',
                    email: 'admin@agilsign.com',
                    password: '123456',
                    role: 'admin'
                });
                console.log('Usuário admin criado com sucesso');
            }
        }
        catch (error) {
            console.error('Erro ao criar usuário admin:', error);
        }
    });
}
function initializeDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield database_1.default.authenticate();
            console.log('Conexão com o MySQL estabelecida com sucesso.');
            // Sincroniza os modelos com o banco de dados sem forçar recriação
            yield database_1.default.sync();
            console.log('Modelos sincronizados com o banco de dados.');
            // Criar usuário admin se não existir
            yield createAdminUser();
            app.listen(Number(PORT), '0.0.0.0', () => {
                console.log(`Servidor rodando na porta ${PORT}`);
                console.log(`Frontend URL: ${FRONTEND_URL}`);
            });
        }
        catch (error) {
            console.error('Erro ao conectar ao banco de dados:', error);
            process.exit(1);
        }
    });
}
initializeDatabase();
