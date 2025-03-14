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

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/termos', authMiddleware, termoRoutes);

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
    console.log('Conexão com o SQLite estabelecida com sucesso.');

    // Força a recriação das tabelas
    await sequelize.sync({ force: true });
    console.log('Modelos sincronizados com o banco de dados (tabelas recriadas).');

    // Criar usuário admin
    await createAdminUser();

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  }
}

initializeDatabase(); 