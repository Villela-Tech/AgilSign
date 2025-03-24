FROM node:18-alpine

# Criar diretório da aplicação
WORKDIR /usr/src/app

# Instalar PM2 globalmente
RUN npm install pm2 -g

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Criar diretórios de logs
RUN mkdir -p logs/pm2

# Expor porta
EXPOSE 443

# Iniciar com PM2 em modo cluster
CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]