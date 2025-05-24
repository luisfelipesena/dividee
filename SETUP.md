# Carteira Backend Setup Guide

Este guia irá te ajudar a configurar o backend do Carteira com Drizzle + PostgreSQL.

## 📋 Pré-requisitos

- Node.js 18+ 
- pnpm 
- Docker e Docker Compose

## 🚀 Setup Inicial

### 1. Instalar Dependências

```bash
# Na raiz do projeto
pnpm install

# Instalar dependências específicas do web app
cd apps/web
pnpm install
```

### 2. Configurar Variáveis de Ambiente

Crie o arquivo `apps/web/.env.local`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=dividee_user
DB_PASSWORD=dividee_password
DB_NAME=dividee

# Application Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=super-secret-jwt-key-for-development

# JWT Configuration
JWT_SECRET=super-secret-jwt-key-for-development

# Email Configuration (para uso futuro)
EMAIL_FROM=noreply@dividee.com
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=
EMAIL_SERVER_PASSWORD=

# Bitwarden Integration (para uso futuro)
BITWARDEN_CLIENT_ID=
BITWARDEN_CLIENT_SECRET=
BITWARDEN_API_URL=https://api.bitwarden.com

# Payment Gateway (para uso futuro)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
```

### 3. Iniciar Banco de Dados

```bash
# Na raiz do projeto
docker-compose up -d
```

Isso irá iniciar:
- PostgreSQL na porta 5432
- pgAdmin na porta 5050 (http://localhost:5050)
  - Email: admin@dividee.com
  - Senha: admin123

### 4. Configurar Database Schema

```bash
# No diretório apps/web
cd apps/web

# Gerar e aplicar migrações
pnpm run db:push

# (Opcional) Abrir Drizzle Studio para visualizar o banco
pnpm run db:studio
```

### 5. Iniciar Aplicação

```bash
# No diretório apps/web
pnpm run dev
```

A aplicação estará disponível em http://localhost:3000

## 🔧 Comandos Úteis

### Database

```bash
# Gerar migrações
pnpm run db:generate

# Aplicar migrações
pnpm run db:migrate

# Push schema (para desenvolvimento)
pnpm run db:push

# Abrir Drizzle Studio
pnpm run db:studio
```

### Docker

```bash
# Iniciar serviços
docker-compose up -d

# Parar serviços
docker-compose down

# Ver logs
docker-compose logs -f postgres

# Reset completo do banco
docker-compose down -v
docker-compose up -d
```

## 📊 Acessar pgAdmin

1. Acesse http://localhost:5050
2. Login: admin@dividee.com / admin123
3. Adicionar servidor:
   - Host: postgres (nome do container)
   - Port: 5432
   - Database: dividee
   - Username: dividee_user
   - Password: dividee_password

## 🧪 Testar APIs

### Signup

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Criar Grupo (use o token do login)

```bash
curl -X POST http://localhost:3000/api/groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"name":"Meu Grupo","description":"Grupo para compartilhar Netflix"}'
```

### Listar Grupos

```bash
curl -X GET http://localhost:3000/api/groups \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📝 Schemas Implementados

- ✅ **Users** - Autenticação e perfis
- ✅ **Groups** - Grupos privados de usuários  
- ✅ **Subscriptions** - Assinaturas compartilhadas
- ✅ **GroupMembers** - Membros dos grupos
- ✅ **SubscriptionMembers** - Membros das assinaturas
- ✅ **AccessRequests** - Solicitações de acesso
- ✅ **Payments** - Transações financeiras
- ✅ **Notifications** - Sistema de notificações
- ✅ **FinancialSummary** - Resumo financeiro para analytics

## 🔗 APIs Implementadas

### Autenticação
- ✅ `POST /api/auth/signup` - Cadastro
- ✅ `POST /api/auth/login` - Login  
- ✅ `POST /api/auth/logout` - Logout
- ✅ `GET /api/auth/session` - Sessão atual

### Grupos
- ✅ `GET /api/groups` - Listar grupos do usuário
- ✅ `POST /api/groups` - Criar grupo

### Próximas Features
- 🔄 APIs de Subscriptions
- 🔄 Sistema de convites
- 🔄 Fluxo de solicitação de acesso
- 🔄 Dashboard financeiro
- 🔄 Sistema de notificações

## ⚠️ Troubleshooting

### Erro de conexão com banco
- Verifique se o Docker está rodando
- Verifique se as portas 5432 e 5050 estão livres
- Confirme as variáveis de ambiente

### Erros de TypeScript
- As dependências ainda não foram instaladas
- Execute `pnpm install` na raiz e em `apps/web`

### Erro "Module not found"
- Certifique-se de estar no diretório correto (`apps/web`)
- Execute `pnpm install` novamente 