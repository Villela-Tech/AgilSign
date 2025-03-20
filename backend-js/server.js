const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const termoRoutes = require('./routes/termo.routes');
const User = require('./models/user.model');
const { authMiddleware } = require('./middleware/auth.middleware');
const config = require('./config/config');

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 443;
const HOST = '0.0.0.0'; // Permite conexões de qualquer IP

// Middlewares
app.use(cors({
  origin: '*',  // Permite todas as origens
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Access-Control-Allow-Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: false, // Desativa credentials quando using origin: '*'
  maxAge: 86400 // Cache preflight por 24 horas
}));

// Adiciona headers de segurança e CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Handle OPTIONS method
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Log de todas as requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// Rota de verificação de saúde
app.get('/', (req, res) => {
  res.json({ 
    message: 'API AgilSign está funcionando!', 
    status: 'online', 
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || req.connection.remoteAddress,
    domain: config.BASE_URL
  });
});

// Rota de verificação explícita de API
app.get('/api', (req, res) => {
  res.json({ 
    message: 'API AgilSign está funcionando!', 
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString(),
    ipAddress: req.ip || req.connection.remoteAddress,
    domain: config.BASE_URL,
    routes: {
      auth: '/api/auth',
      termos: '/api/termos'
    }
  });
});

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
    console.log('Conexão com o MySQL estabelecida com sucesso.');

    // Sincroniza os modelos com o banco de dados (sem forçar alterações)
    await sequelize.sync({ force: false, alter: false });
    console.log('Modelos sincronizados com o banco de dados.');

    // Criar usuário admin se não existir
    await createAdminUser();

    try {
      // Configuração HTTPS
      const certPath = '/etc/letsencrypt/live/apiagilsign.villelatech.com.br';
      console.log('Verificando certificados em:', certPath);
      
      const httpsOptions = {
        key: fs.readFileSync(path.join(certPath, 'privkey.pem')),
        cert: fs.readFileSync(path.join(certPath, 'fullchain.pem')),
        ca: fs.readFileSync(path.join(certPath, 'chain.pem')),
        secureProtocol: 'TLSv1_2_method',
        ciphers: [
          "ECDHE-RSA-AES128-GCM-SHA256",
          "ECDHE-ECDSA-AES128-GCM-SHA256",
          "ECDHE-RSA-AES256-GCM-SHA384",
          "ECDHE-ECDSA-AES256-GCM-SHA384",
          "DHE-RSA-AES128-GCM-SHA256",
          "ECDHE-RSA-AES128-SHA256",
          "DHE-RSA-AES128-SHA256",
          "ECDHE-RSA-AES256-SHA384",
          "DHE-RSA-AES256-SHA384",
          "ECDHE-RSA-AES256-SHA256",
          "DHE-RSA-AES256-SHA256",
          "HIGH",
          "!aNULL",
          "!eNULL",
          "!EXPORT",
          "!DES",
          "!RC4",
          "!MD5",
          "!PSK",
          "!SRP",
          "!CAMELLIA"
        ].join(':'),
        honorCipherOrder: true,
        minVersion: 'TLSv1.2'
      };

      // Criar servidor HTTPS
      const server = https.createServer(httpsOptions, app);

      server.listen(PORT, HOST, () => {
        console.log(`Servidor HTTPS rodando em ${HOST}:${PORT}`);
        console.log(`API disponível em: https://${config.BASE_URL}`);
      });

    } catch (sslError) {
      console.error('Erro ao configurar SSL:', sslError);
      console.log('Iniciando servidor sem SSL...');
      
      // Fallback para HTTP se o SSL falhar
      app.listen(PORT, HOST, () => {
        console.log(`Servidor HTTP rodando em ${HOST}:${PORT}`);
        console.log(`API disponível em: http://${config.BASE_URL}`);
      });
    }
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  }
}

// Tratamento de erros
process.on('uncaughtException', (error) => {
  console.error('Erro não tratado:', error);
  // Não encerra o processo para manter o servidor rodando
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promessa rejeitada não tratada:', reason);
  // Não encerra o processo para manter o servidor rodando
});

// Inicia o servidor
initializeDatabase(); 