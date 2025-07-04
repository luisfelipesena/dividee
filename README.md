# Carteira - Gestão de Assinaturas

O Carteira é uma plataforma inovadora que permite compartilhar de forma segura os acessos a serviços de streaming e assinaturas com as pessoas que você mais ama. Com ela, você divide os custos, economiza no orçamento e mantém um controle organizado sobre o uso e a renovação das assinaturas.

## 🗂️ Estrutura do Monorepo

- `apps/mobile`: Aplicativo mobile em React Native (Expo).
- `apps/web`: Aplicativo web em Next.js.
- `apps/server`: Servidor backend em Node.js (Express).
- `packages/`: Pacotes compartilhados (UI, configs, etc. - placeholder).

## 🚀 Rodando Localmente

Este projeto usa `pnpm` como gerenciador de pacotes.

### 1. Iniciar o Banco de Dados

O banco de dados roda em um container Docker. Você precisa ter o Docker instalado e em execução.

```bash
docker-compose up -d
```

### 2. Configurar o Ambiente do Servidor

O servidor precisa de um arquivo `.env` com a string de conexão do banco de dados.

1.  Navegue até o diretório do servidor: `cd apps/server`
2.  Crie um arquivo `.env` manualmente com o seguinte conteúdo:
    ```
    DATABASE_URL="postgresql://carteira:strongpassword@localhost:5432/carteira_dev"
    JWT_SECRET="your-super-secret-jwt-key"
    ```

### 3. Executar as Migrações do Banco de Dados

Com o banco de dados em execução e o arquivo `.env` no lugar, execute as migrações a partir da **raiz** do projeto:

```bash
pnpm --filter server run db:migrate
```

### 4. Executar as Aplicações

Você pode executar cada aplicação em um terminal separado, a partir da **raiz** do projeto.

**Para rodar o Servidor:**

```bash
pnpm --filter server run dev
```

**Para rodar o App Mobile:**

```bash
pnpm --filter mobile start
```

**Para rodar o App Web:**

```bash
pnpm --filter web run dev
```

## ✅ Tudo Pronto!

- O servidor da API estará rodando em `http://localhost:3333`.
- O app mobile abrirá no Expo Go.
- O app web estará em `http://localhost:3000`.

---

## 🔧 Solução de Problemas

### Erro de Autenticação no Banco de Dados

Se você encontrar um erro como `password authentication failed for user "carteira"` ou `Role "carteira" does not exist` ao tentar rodar as migrações, isso significa que o Docker está usando um volume de dados antigo.

Para resolver, pare os containeres e remova o volume para forçar uma reinicialização limpa do banco de dados:

```bash
# Pare e remova os containeres
docker-compose down

# Remova os volumes (isso apagará os dados do banco local)
docker-compose down -v
```

Depois disso, siga as instruções de "Rodando Localmente" novamente, começando pelo passo 1.

---

## 📦 Deploy e Produção

Aqui estão as diretrizes básicas para fazer o deploy de cada parte da aplicação.

### Servidor (`apps/server`)

1.  **Build:** Gere a versão de produção com `pnpm --filter server run build`.
2.  **Ambiente:** Em produção, configure as variáveis de ambiente `DATABASE_URL` (apontando para o banco de produção) e `PORT`.
3.  **Hospedagem:** Faça o deploy em plataformas como Render, Heroku ou um VPS de sua escolha. Execute a aplicação com `node dist/index.js`.

### Web (`apps/web`)

1.  **Build:** O deploy é geralmente feito a partir do seu repositório Git.
2.  **Ambiente:** Configure a variável de ambiente `NEXT_PUBLIC_API_URL` para apontar para a URL do seu servidor em produção.
3.  **Hospedagem:** Plataformas como Vercel e Netlify são ideais para aplicações Next.js e oferecem um processo de deploy simplificado.

### Mobile (`apps/mobile`)

O deploy de aplicativos mobile é feito através das lojas (Apple App Store e Google Play Store) usando o **Expo Application Services (EAS)**.

1.  **Instalar o EAS CLI:**
    ```bash
    pnpm add -g eas-cli
    ```
2.  **Login:** Faça login na sua conta Expo:
    ```bash
    eas login
    ```
3.  **Configurar o Projeto:** Crie o arquivo `eas.json` na raiz de `apps/mobile` para configurar os perfis de build. Exemplo:
    ```json
    {
      "build": {
        "production": {
          "env": {
            "API_URL": "https://sua-api.com"
          },
          "android": {
            "buildType": "apk"
          }
        }
      }
    }
    ```
4.  **Construir o App:** Execute o build para a plataforma desejada. O EAS cuidará de todo o processo de build na nuvem.
    ```bash
    # Para Android
    eas build -p android --profile production

    # Para iOS
    eas build -p ios --profile production
    ```
5.  **Submissão:** Após o build, o EAS fornecerá um link para o artefato (`.apk` ou `.ipa`), que pode ser enviado para a respectiva loja. O EAS também pode automatizar a submissão com o comando `eas submit`. 