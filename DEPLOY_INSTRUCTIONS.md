# 🚀 Instruções de Deploy - Carteira v0

Este documento contém as instruções detalhadas para fazer o deploy completo do sistema Carteira, incluindo backend (Vercel), banco de dados (Supabase) e aplicativo mobile (EAS/Expo).

## 📋 Pré-requisitos

- [ ] Conta no [Supabase](https://app.supabase.com)
- [ ] Conta no [Vercel](https://vercel.com)
- [ ] Conta no [Expo/EAS](https://expo.dev)
- [ ] Conta no [Bitwarden](https://bitwarden.com) (para integração)
- [ ] Node.js 18+ instalado
- [ ] pnpm instalado
- [ ] Git configurado

## 🗄️ 1. Configuração do Banco de Dados (Supabase)

### 1.1. Criar Projeto no Supabase

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Clique em "New Project"
3. Escolha uma organização
4. Preencha:
   - **Name**: `carteira-prod` (ou nome de sua escolha)
   - **Database Password**: Use um password forte (guarde bem!)
   - **Region**: Escolha a região mais próxima dos usuários
5. Clique em "Create new project"
6. Aguarde alguns minutos para o projeto ser criado

### 1.2. Obter Credenciais do Banco

1. No dashboard do projeto, vá em `Settings` > `Database`
2. Role até "Connection Info" e anote:
   - **Host**: `db.<project_ref>.supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: A senha que você criou

3. Monte a DATABASE_URL no formato:
   ```
   postgresql://postgres:[SUA_SENHA]@[HOST]:5432/postgres
   ```

### 1.3. Configurar Variáveis do Supabase

1. Vá em `Settings` > `API`
2. Anote:
   - **URL**: `https://[project_ref].supabase.co`
   - **anon public key**: A chave pública anônima

## 🌐 2. Deploy do Backend (Vercel)

### 2.1. Conectar Repositório

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em "New Project"
3. Conecte com GitHub e selecione o repositório
4. Configure o projeto:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `cd ../.. && pnpm turbo run build --filter=web`
   - **Output Directory**: `.next`
   - **Install Command**: `cd ../.. && pnpm install --frozen-lockfile`

### 2.2. Configurar Variáveis de Ambiente

No Vercel, vá em `Settings` > `Environment Variables` e adicione:

```bash
# Database
DATABASE_URL=postgresql://postgres:[SENHA]@[HOST]:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project_ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon_key]

# JWT Secret (gere com: openssl rand -base64 32)
JWT_SECRET=[seu_jwt_secret_forte]

# Bitwarden (configure depois de criar conta empresarial)
BITWARDEN_CLIENT_ID=[client_id]
BITWARDEN_CLIENT_SECRET=[client_secret]
BITWARDEN_API_URL=https://api.bitwarden.com

# Automação (para cron jobs)
AUTOMATION_SECRET=[secret_para_automacao]
```

### 2.3. Executar Migrações

Antes do primeiro deploy, execute as migrações do banco:

1. Clone o repositório localmente
2. Configure o `.env.local` com as variáveis de produção
3. Execute:
   ```bash
   cd apps/web
   pnpm run db:migrate
   ```

### 2.4. Deploy

1. Faça commit das alterações
2. Push para a branch main
3. O Vercel fará o deploy automaticamente
4. Acesse a URL fornecida para testar

## 📱 3. Deploy do Mobile (EAS/Expo)

### 3.1. Configurar EAS CLI

```bash
npm install -g @expo/eas-cli
eas login
```

### 3.2. Configurar Projeto

1. No diretório `apps/mobile`:
   ```bash
   cd apps/mobile
   eas build:configure
   ```

2. Edite o `eas.json`:
   ```json
   {
     "build": {
       "production": {
         "node": "20.9.0",
         "env": {
           "EXPO_PUBLIC_API_URL": "https://[sua-url-vercel].vercel.app"
         }
       },
       "preview": {
         "node": "20.9.0",
         "env": {
           "EXPO_PUBLIC_API_URL": "https://[sua-url-vercel].vercel.app"
         }
       }
     },
     "submit": {
       "production": {}
     }
   }
   ```

### 3.3. Build e Submit

Para Android:
```bash
eas build --platform android --profile production
eas submit --platform android --latest
```

Para iOS:
```bash
eas build --platform ios --profile production
eas submit --platform ios --latest
```

## 🔧 4. Configuração do Bitwarden

### 4.1. Criar Conta Empresarial

1. Acesse [Bitwarden Business](https://bitwarden.com/products/business/)
2. Crie uma conta empresarial
3. Vá em `Settings` > `Organizations` > `API Keys`
4. Gere um Client ID e Client Secret
5. Atualize as variáveis de ambiente no Vercel

### 4.2. Configurar Permissões

1. Certifique-se de que a API key tem permissões para:
   - Criar e gerenciar items de login
   - Acessar e atualizar credenciais
   - Gerar senhas

## ⚙️ 5. Configuração de Automação

### 5.1. Configurar Cron Jobs

Configure um serviço de cron (como GitHub Actions ou Vercel Cron) para chamar:

```
POST https://[sua-url].vercel.app/api/notifications/automation
Authorization: Bearer [AUTOMATION_SECRET]
```

Recomendado executar a cada 6 horas.

### 5.2. GitHub Actions (Opcional)

Crie `.github/workflows/automation.yml`:

```yaml
name: Notification Automation
on:
  schedule:
    - cron: '0 */6 * * *' # Every 6 hours
jobs:
  run-automation:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Automation
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.AUTOMATION_SECRET }}" \
            https://[sua-url].vercel.app/api/notifications/automation
```

## 🧪 6. Testes Pós-Deploy

### 6.1. Testes de Backend

1. **Autenticação**:
   ```bash
   curl -X POST https://[sua-url]/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"senha123","name":"Teste"}'
   ```

2. **Login**:
   ```bash
   curl -X POST https://[sua-url]/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"senha123"}'
   ```

3. **Dashboard**:
   ```bash
   curl https://[sua-url]/api/dashboard/financial \
     -H "Authorization: Bearer [TOKEN]"
   ```

### 6.2. Testes de Mobile

1. Baixe o app do TestFlight (iOS) ou Play Console (Android)
2. Teste as funcionalidades principais:
   - Login/Cadastro
   - Dashboard
   - Explorar assinaturas
   - Grupos
   - Perfil

### 6.3. Testes de Integração

1. **Bitwarden**: Crie uma assinatura e teste o armazenamento de credenciais
2. **Notificações**: Verifique se as notificações automáticas estão funcionando
3. **Auditoria**: Acesse `/api/audit/logs` e verifique se os logs estão sendo criados

## 🔐 7. Configurações de Segurança

### 7.1. Domínio e SSL

1. Configure um domínio personalizado no Vercel
2. O SSL é automático no Vercel
3. Atualize as URLs de callback no Supabase:
   - `Settings` > `Authentication` > `URL Configuration`
   - Site URL: `https://[seu-dominio].com`
   - Redirect URLs: `https://[seu-dominio].com/**`

### 7.2. Variáveis de Produção

Certifique-se de que todas as variáveis estão configuradas corretamente:
- JWT_SECRET: Forte e único
- AUTOMATION_SECRET: Forte e único
- Credenciais do Bitwarden: Válidas e com permissões adequadas

## 📊 8. Monitoramento

### 8.1. Vercel Analytics

1. Ative o Vercel Analytics no dashboard
2. Configure alertas para erros e performance

### 8.2. Supabase Monitoring

1. Configure alertas no Supabase para:
   - Uso de CPU/Memória
   - Conexões de banco
   - Erros de API

### 8.3. Logs de Auditoria

Monitore regularmente os logs de auditoria através do endpoint `/api/audit/logs`

## 🚨 9. Backup e Recuperação

### 9.1. Backup do Banco

O Supabase faz backups automáticos, mas configure também:
1. Backups diários automáticos
2. Retenção por 30 dias mínimo

### 9.2. Backup de Configurações

Mantenha um backup seguro de todas as variáveis de ambiente e configurações.

## ✅ 10. Checklist Final

- [ ] Supabase configurado e funcionando
- [ ] Migrações executadas com sucesso
- [ ] Backend deployado no Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Mobile app buildado e publicado
- [ ] Bitwarden integração funcionando
- [ ] Automação de notificações ativa
- [ ] Domínio configurado com SSL
- [ ] Monitoramento ativo
- [ ] Backups configurados
- [ ] Testes de produção realizados

## 🆘 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco**: Verifique DATABASE_URL
2. **JWT inválido**: Verifique JWT_SECRET
3. **Bitwarden falha**: Verifique credenciais e permissões
4. **Mobile não conecta**: Verifique EXPO_PUBLIC_API_URL
5. **Migrações falharam**: Verifique permissões do usuário postgres

### Logs

- **Vercel**: Functions > View Logs
- **Supabase**: Logs > API Logs
- **Expo**: Build logs no dashboard

---

🎉 **Parabéns!** Se você chegou até aqui, o sistema Carteira v0 está deployado e funcionando em produção!

Para suporte adicional, consulte a documentação ou entre em contato com a equipe de desenvolvimento.