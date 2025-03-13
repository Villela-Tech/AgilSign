import express from 'express';
import cors from 'cors';
import sequelize from './config/database';
import termoRoutes from './routes/termo.routes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api', termoRoutes);

async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o SQLite estabelecida com sucesso.');

    await sequelize.sync();
    console.log('Modelos sincronizados com o banco de dados.');

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  }
}

initializeDatabase(); 