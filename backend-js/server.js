require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const fs = require('fs');
const https = require('https');
const { Sequelize } = require('sequelize');
const winston = require('winston');
const rateLimit = require('express-rate-limit');
const { authMiddleware } = require('./middleware/auth.middleware');

// Configuração do Logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const app = express();

// Configurações básicas
const PORT = process.env.PORT || 443;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware de segurança
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração do CORS
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS === '*' 
    ? '*' 
    : process.env.ALLOWED_ORIGINS.split(','),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de 100 requisições por windowMs
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

// Configuração do Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: (msg) => logger.debug(msg)
  }
);

// Rota de Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Importar rotas
const authRoutes = require('./routes/auth.routes');
const termoRoutes = require('./routes/termo.routes');

// Rotas públicas
app.use('/api/auth', authRoutes);

// Rotas protegidas
app.use('/api/termos', authMiddleware, termoRoutes);

// Middleware de erro global
app.use((err, req, res, next) => {
  logger.error('Erro:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Inicialização do banco de dados
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    logger.info('Conexão com o banco de dados estabelecida com sucesso.');
    
    // Sincronize os modelos com o banco de dados
    await sequelize.sync({ force: true }); // Força a recriação das tabelas
    logger.info('Modelos sincronizados com o banco de dados.');

    // Criar usuário admin
    const User = require('./models/user.model');
    const adminExists = await User.findOne({ where: { email: 'admin@agilsign.com' } });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@agilsign.com',
        password: process.env.ADMIN_PASSWORD || '123456',
        role: 'admin'
      });
      logger.info('Usuário admin criado com sucesso.');
    }
  } catch (error) {
    logger.error('Erro ao conectar com o banco de dados:', error);
    process.exit(1);
  }
}

// Inicialização do servidor
async function startServer() {
  await initializeDatabase();

  try {
    const privateKey = fs.readFileSync(process.env.SSL_KEY_PATH, 'utf8');
    const certificate = fs.readFileSync(process.env.SSL_CERT_PATH, 'utf8');
    const credentials = { key: privateKey, cert: certificate };

    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(PORT, HOST, () => {
      logger.info(`Servidor HTTPS rodando em https://${HOST}:${PORT}`);
    });
  } catch (error) {
    logger.error('Erro ao iniciar servidor HTTPS:', error);
    process.exit(1);
  }
}

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  logger.error('Erro não tratado:', error);
});

process.on('unhandledRejection', (error) => {
  logger.error('Promise rejection não tratada:', error);
});

startServer();