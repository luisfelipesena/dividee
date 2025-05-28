# Plano de Ação: Projeto Carteira

## Introdução

Este plano detalha os próximos passos para o desenvolvimento, teste e deploy da aplicação "Carteira". O objetivo é fornecer um guia claro e acionável, com foco especial no deployment do banco de dados PostgreSQL utilizando Supabase, e nas funcionalidades pendentes para o MVP.

---

## Fase 1: Testes das Funcionalidades Existentes

Com base no arquivo `SETUP.md`, as seguintes funcionalidades e schemas já foram implementados e devem ser testados exaustivamente:

**Schemas Implementados:**

- Users
- Groups
- Subscriptions
- GroupMembers
- SubscriptionMembers
- AccessRequests
- Payments
- Notifications
- FinancialSummary

**APIs Implementadas e Como Testar:**

**Regra Geral para Testes:** Utilize uma ferramenta como Postman, Insomnia ou `curl`. Obtenha um token de autenticação após o login para usar em rotas protegidas.

1.  **Autenticação (`/api/auth`)**

    - `POST /signup`:
      - **Teste:** Cadastrar novo usuário com email, senha e nome.
      - **Verificar:** Criação bem-sucedida (status 201), dados do usuário no banco, resposta JSON. Testar com dados inválidos/duplicados.
    - `POST /login`:
      - **Teste:** Login com credenciais válidas e inválidas.
      - **Verificar:** Resposta com token JWT (status 200) para sucesso, erro (status 401) para falha.
    - `POST /logout`:
      - **Teste:** Fazer logout com um token válido.
      - **Verificar:** Resposta de sucesso (status 200), invalidação do token (se aplicável do lado do servidor).
    - `GET /session`:
      - **Teste:** Acessar com token válido.
      - **Verificar:** Retorno dos dados da sessão do usuário (status 200).

2.  **Grupos (`/api/groups`)**

    - `POST /groups`:
      - **Pré-requisito:** Usuário autenticado.
      - **Teste:** Criar um novo grupo com nome e descrição.
      - **Verificar:** Criação bem-sucedida (status 201), dados do grupo no banco, associação ao usuário.
    - `GET /groups`:
      - **Pré-requisito:** Usuário autenticado.
      - **Teste:** Listar os grupos do usuário.
      - **Verificar:** Retorno da lista de grupos (status 200).

3.  **Notificações (`/api/notifications`)**
    - `PUT /api/notifications/[id]/read`:
      - **Pré-requisito:** Usuário autenticado, notificação existente para o usuário.
      - **Teste:** Marcar uma notificação como lida.
      - **Verificar:** Atualização no banco (`is_read = true`, `read_at` preenchido), resposta de sucesso (status 200). Testar com ID inválido ou de outro usuário (esperado 404).

**Outras APIs e Funcionalidades (conforme `SETUP.md` indica schemas, mas não APIs explícitas):**

- **Subscriptions:** Testar criação, listagem, detalhes.
- **GroupMembers:** Testar adição/remoção de membros a grupos.
- **SubscriptionMembers:** Testar adição/remoção de membros a subscriptions.
- **AccessRequests:** Testar criação de solicitação, aprovação/rejeição.
- **Payments:** Testar registro de pagamentos.
- **FinancialSummary:** Validar a lógica de agregação (pode exigir testes mais focados nos dados).

---

## Fase 2: Desenvolvimento das Funcionalidades Pendentes (MVP)

Com base no `PRODUCT_DOCUMENTATION.md` (Seções 4.1 a 4.5 e 6), as seguintes funcionalidades são cruciais para o MVP e precisam de desenvolvimento ou finalização:

**Prioridade Alta:**

1.  **Gestão de Contas Compartilhadas (Ref. `PRODUCT_DOCUMENTATION.md` 4.1):**

    - [ ] **Cadastro Completo de Subscriptions:**
      - [ ] API e UI para registrar nova subscription (tipo: pública/privada, valor, max membros, data expiração/renovação).
    - [ ] **Controle de Expiração:**
      - [ ] Sistema de alertas antecipados (notificações para admin e usuários).
      - [ ] Monitoramento automático e lógica para renovação.
      - [ ] Gestão de trocas periódicas de senha (relacionado à integração Bitwarden).

2.  **Fluxo de Acesso (Ref. `PRODUCT_DOCUMENTATION.md` 4.2):**

    - [ ] **Solicitação de Acesso:**
      - [ ] API e UI para usuários solicitarem participação em subscriptions públicas.
      - [ ] Formulário com justificativa (opcional).
      - [ ] Visualização de valor e regras.
      - [ ] Confirmação de termos de uso.
    - [ ] **Gestão de Aprovações:**
      - [ ] API e UI (Dashboard do Admin) para visualizar e aprovar/rejeitar solicitações.
      - [ ] Comunicação automática (notificação) com solicitante.
      - Já existe a API `/api/access-requests/[id]/approve` e `/api/access-requests/[id]/reject`. É preciso garantir que o fluxo completo, incluindo a interface e as notificações, esteja funcional.

3.  **Sistema de Notificações Completo (Ref. `PRODUCT_DOCUMENTATION.md` 4.3):**

    - [ ] **Notificações para Admin:**
      - [ ] Alertas de necessidade de troca de senha.
      - [ ] Notificações de novas solicitações de acesso.
      - [ ] Alertas de problemas de pagamento.
      - [ ] Lembretes de ações pendentes.
    - [ ] **Notificações para Usuários:**
      - [ ] Lembretes de pagamento.
      - [ ] Avisos de renovação próxima.
      - [ ] Confirmações de alterações de senha.
      - [ ] Atualizações de status de solicitação.
    - A base (`notifications` schema e API para marcar como lida) existe. É preciso criar os gatilhos e tipos de notificação.

4.  **Integração Bitwarden (Ref. `PRODUCT_DOCUMENTATION.md` 4.4):**

    - [ ] **Conexão Segura com API Bitwarden:** Implementar a lógica para interagir com a API.
    - [ ] **Gestão Automatizada de Credenciais:** Para subscriptions que utilizarem Bitwarden.
    - [ ] **Compartilhamento Seguro e Rotação de Senhas.**
    - _Nota: As variáveis de ambiente `BITWARDEN_CLIENT_ID`, `BITWARDEN_CLIENT_SECRET`, `BITWARDEN_API_URL` já estão no `.env.local` do `SETUP.md`._

5.  **Dashboard Financeiro (Ref. `PRODUCT_DOCUMENTATION.md` 4.5):**
    - [ ] **Visualização de Economia:**
      - [ ] API e UI para calcular e exibir economia individual e do grupo.
    - [ ] **Histórico de Transações:**
      - [ ] API e UI para registro e visualização de pagamentos, renovações, extratos.
      - O schema `FinancialSummary` pode ser a base para os dados agregados.

**Prioridade Média (Pós-MVP Essencial):**

- [ ] **Sistema de Convites (Ref. `SETUP.md` - Próximas Features):** Para adicionar membros a grupos/subscriptions privadas.
- [ ] **Requisitos Técnicos Essenciais (Ref. `PRODUCT_DOCUMENTATION.md` 4.6):**
  - [ ] Autenticação de dois fatores (2FA).
  - [ ] Criptografia de dados sensíveis (além do que o Bitwarden oferecer).

---

## Fase 3: Preparação e Execução do Deploy

Esta seção expande o `DEPLOY.MD` com foco no banco de dados e outros detalhes.

### 3.1. Configuração do Banco de Dados de Produção (Supabase/PostgreSQL)

O Supabase oferece uma instância PostgreSQL gerenciada que usaremos para produção.

1.  **Criar Projeto no Supabase:**

    - Acesse [Supabase Dashboard](https://app.supabase.com) e crie um novo projeto.
    - Durante a criação, será gerada uma senha para o banco de dados. **Guarde-a em local seguro.** Você também pode resetá-la depois em Project Settings > Database > Connection Info.
    - Escolha a região mais próxima dos seus usuários.

2.  **Obter Credenciais de Conexão do Banco PostgreSQL:**

    - No seu projeto Supabase, vá para: `Project Settings` > `Database`.
    - Você encontrará as informações de conexão:
      - **Host:** (ex: `db.<project_ref>.supabase.co`)
      - **Database name:** `postgres` (geralmente)
      - **Port:** `5432`
      - **User:** `postgres`
      - **Password:** A senha que você guardou/resetou.
    - Com essas informações, você montará a `DATABASE_URL` no formato:
      `postgresql://postgres:[SUA_SENHA_AQUI]@[HOST_AQUI]:5432/postgres`

3.  **Configurar Variáveis de Ambiente no Vercel:**

    - No seu projeto Vercel (`apps/web`), vá em `Settings` > `Environment Variables`.
    - Adicione a variável `DATABASE_URL` com o valor obtido no passo anterior. Esta será usada pelo Drizzle ORM para se conectar ao banco de produção.
    - Adicione também (conforme `DEPLOY.MD`):
      - `NEXT_PUBLIC_SUPABASE_URL`: URL do seu projeto Supabase (Project Settings > API).
      - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anônima pública do Supabase (Project Settings > API).
      - `JWT_SECRET` (ou `NEXTAUTH_SECRET`): Um segredo forte para assinar os JWTs, diferente do de desenvolvimento. Gere um com `openssl rand -base64 32`.

4.  **Executar Migrações do Drizzle no Banco de Produção:**
    - **Estratégia Recomendada:** Antes do primeiro deploy ou sempre que houver novas migrações, você precisa aplicá-las ao banco de produção do Supabase.
    - **Opção 1: Manualmente via `psql` (para o primeiro deploy ou setups simples):**
      1.  Conecte-se ao seu banco Supabase usando um cliente PSQL ou uma ferramenta de DB como pgAdmin/DBeaver usando as credenciais acima.
      2.  No seu ambiente de desenvolvimento local, gere os arquivos SQL de migração se ainda não o fez:
          ```bash
          cd apps/web
          pnpm run db:generate
          ```
          Isso cria arquivos SQL na pasta `drizzle` (ou configurada).
      3.  Copie o conteúdo desses arquivos SQL (na ordem correta) e execute-os no seu banco de produção Supabase.
    - **Opção 2: Script no Pipeline de CI/CD (mais robusto para o futuro):**
      1.  No seu pipeline de CI/CD (ex: GitHub Actions), adicione um passo que:
          - Instale as dependências (`pnpm install`).
          - Tenha acesso à `DATABASE_URL` de produção como um segredo.
          - Execute o comando de migração do Drizzle:
            ```bash
            cd apps/web
            pnpm run db:migrate
            ```
          - Este comando aplicará as migrações pendentes.
    - **Importante:** O comando `pnpm run db:push` (usado em desenvolvimento no `SETUP.md`) **NÃO é recomendado para produção**, pois pode causar perda de dados. Use sempre `db:generate` e `db:migrate` (ou o SQL gerado) para produção.

### 3.2. Deploy do Backend/Web App (Next.js no Vercel)

Siga os passos do `DEPLOY.MD`, com as seguintes observações:

1.  **Conectar ao GitHub e Configurar Build:**

    - Framework Preset: `Next.js`.
    - Root Directory: `apps/web`.
    - Build Command: `cd ../.. && pnpm turbo run build --filter=web` (correto conforme `DEPLOY.MD`).
    - Output Directory: `.next`.
    - Install Command: `cd ../.. && pnpm install --frozen-lockfile && cd apps/web && pnpm install --frozen-lockfile` (para garantir que o pnpm workspace funcione corretamente na Vercel).

2.  **Variáveis de Ambiente:**

    - Confirme que `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, e `JWT_SECRET` (ou `NEXTAUTH_SECRET`) estão configuradas no Vercel.

3.  **Deploy e Domínio:**
    - Após o deploy, Vercel fornecerá uma URL (ex: `xxxx.vercel.app`).
    - Configure seu domínio personalizado para apontar para esta URL.
    - Adicione a URL de produção do Vercel (e seu domínio personalizado) às "Redirect URLs" e "Site URL" nas configurações de Autenticação do Supabase (Project Settings > Authentication).

### 3.3. Deploy do Mobile App (Expo EAS)

Siga os passos do `DEPLOY.MD`:

1.  **Instalar EAS CLI e Login.**
2.  **Inicializar EAS:** `cd apps/mobile && eas build:configure`.
3.  **Variáveis de Ambiente no Expo Dashboard (EAS Build Secrets):**

    - Adicione `EXPO_PUBLIC_API_URL` com a URL de produção do seu backend Vercel (ex: `https://seu-dominio.com` ou `https://xxxx.vercel.app`).
    - Não confunda com as variáveis do `eas.json`; os segredos são mais seguros para chaves de API, mas para URLs públicas, o `eas.json` ou `.env` podem ser usados. Para `EXPO_PUBLIC_API_URL`, o `env` no `eas.json` (como no `DEPLOY.MD`) é adequado.

4.  **EAS Build Profile (`eas.json`):**

    - A configuração no `DEPLOY.MD` está correta:

    ```json
    {
      "build": {
        "production": {
          "node": "20.9.0", // Verifique a versão Node compatível/desejada
          "env": {
            "EXPO_PUBLIC_API_URL": "https://your-vercel-deployment-url.vercel.app"
          }
        }
      }
    }
    ```

5.  **Build e Submit:**
    - `eas build --platform <ios|android> --profile production`
    - `eas submit --platform <ios|android> --latest`

### 3.4. Configurações Pós-Deploy

1.  **Testes End-to-End:** Após o deploy, realize testes completos em ambiente de produção para garantir que tudo funciona como esperado.
2.  **Monitoramento:**
    - Vercel oferece Analytics e Logging.
    - Considere integrar Sentry (ou similar) para monitoramento de erros no frontend e backend.
3.  **Backups do Banco de Dados:** O Supabase gerencia backups automáticos, mas familiarize-se com as opções de restauração.

---

## Considerações Finais

- Este plano cobre o essencial para o MVP e o deploy inicial.
- Priorize a segurança, especialmente com chaves de API e credenciais de banco de dados.
- Itere sobre o produto com base no feedback dos usuários após o lançamento do MVP.
- Mantenha a documentação (`PRODUCT_DOCUMENTATION.md`, `SETUP.md`, `DEPLOY.MD` e este `plan.md`) atualizada.

Boa sorte com os próximos passos!
