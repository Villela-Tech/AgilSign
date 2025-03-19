import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database';
import authRoutes from './routes/auth.routes';
import termoRoutes from './routes/termo.routes';
import User from './models/user.model';
import { authMiddleware } from './middleware/auth.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://ville5113.c44.integrator.host';

// Middlewares
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/termos', authMiddleware, termoRoutes);

// Status da aplicação
app.get('/status', (req, res) => {
  res.status(200).json({ status: 'online', environment: process.env.NODE_ENV });
});

async function createAdminUser() {
  try {
    const adminUser = await User.findOne({ where: { email: 'admin@agilsign.com' } });
    if (!adminUser) {
      await User.create({
        name: 'Admin',
        email: 'admin@agilsign.com',
        password: '123456',
        role: 'admin'
      });
      console.log('Usuário admin criado com sucesso');
    }
  } catch (error) {
    console.error('Erro ao criar usuário admin:', error);
  }
}

async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o MySQL estabelecida com sucesso.');

    // Sincroniza os modelos com o banco de dados sem forçar recriação
    await sequelize.sync();
    console.log('Modelos sincronizados com o banco de dados.');

    // Criar usuário admin se não existir
    await createAdminUser();

    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Frontend URL: ${FRONTEND_URL}`);
    });
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  }
}

initializeDatabase(); 