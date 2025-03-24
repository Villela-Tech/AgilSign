# AgilSign Backend

Backend do sistema AgilSign para gerenciamento de termos de recebimento.

## Requisitos

- Node.js 14.x ou superior
- PM2 (Process Manager)
- SQLite3

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Instale o PM2 globalmente (se ainda não tiver):
```bash
npm install -g pm2
```

3. Configure as variáveis de ambiente:
- Copie o arquivo `.env.example` para `.env`
- Ajuste as variáveis conforme necessário

## Execução

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
pm2 start ecosystem.config.js
```

### Comandos PM2 úteis

- Listar processos:
```bash
pm2 list
```

- Monitorar processos:
```bash
pm2 monit
```

- Ver logs:
```bash
pm2 logs
```

- Parar aplicação:
```bash
pm2 stop agilsign-backend
```

- Reiniciar aplicação:
```bash
pm2 restart agilsign-backend
```

- Remover aplicação:
```bash
pm2 delete agilsign-backend
```

## Estrutura do Projeto

```
backend-js/
├── config/
│   └── database.js
├── controllers/
│   ├── auth.controller.js
│   └── TermoController.js
├── middleware/
│   └── auth.middleware.js
├── models/
│   ├── user.model.js
│   └── Termo.js
├── routes/
│   ├── auth.routes.js
│   └── termo.routes.js
├── services/
│   └── pdfService.js
├── server.js
├── ecosystem.config.js
└── package.json
```

## Endpoints

### Autenticação
- POST /api/auth/register - Registro de usuário
- POST /api/auth/login - Login de usuário

### Termos
- POST /api/termos - Criar novo termo
- GET /api/termos - Listar todos os termos
- GET /api/termos/:id - Buscar termo por ID
- GET /api/termos/acesso/:urlAcesso - Buscar termo por URL de acesso
- PATCH /api/termos/:id/status - Atualizar status do termo
- DELETE /api/termos/:id - Excluir termo
- GET /api/termos/:id/pdf - Download do PDF do termo 