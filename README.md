# Guia de Deploy do Monorepo Dividee

Este documento contém as instruções para build, deploy e configuração dos ambientes de desenvolvimento, staging e produção para o monorepo Dividee.

## Pré-requisitos

- [Bun](https://bun.sh/) instalado
- Conta na [Vercel](https://vercel.com/) (para deploy do web app)
- Conta na [Expo](https://expo.dev/) (para deploy do mobile app)
- [EAS CLI](https://docs.expo.dev/eas-update/getting-started/) instalado: `bun install -g eas-cli`

## 1. Configuração Inicial

### Login no Expo (para mobile)

```bash
eas login
```

### Clone e instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/dividee.git
cd dividee

# Instale as dependências
bun install
```

## 2. Ambientes

### Configurar variáveis de ambiente

#### Web (Next.js)

Crie arquivos `.env.local`, `.env.development`, `.env.production` na pasta `apps/web`:

```bash
# Exemplo para .env.production
NEXT_PUBLIC_API_URL=https://api.example.com
```

#### Mobile (Expo)

Edite o arquivo `apps/mobile/app.config.js` para cada ambiente:

```js
export default {
  expo: {
    // Configurações comuns
    name: "Dividee",
    // ...
    extra: {
      apiUrl: process.env.API_URL || "https://api.example.com",
    },
  },
};
```

## 3. Processo de Build e Deploy

### Core Package

```bash
# Build do pacote core
bun run core:build
```

### Web App (Next.js)

#### Build local

```bash
# Build do app web (inclui build do core)
bun run web:build

# Teste local do build
bun --cwd apps/web start
```

#### Deploy na Vercel

```bash
# Instale o CLI da Vercel (se necessário)
bun install -g vercel

# Deploy em produção
cd apps/web
vercel --prod
```

### Mobile App (Expo)

#### Build de preview

```bash
# Gere um build de teste (APK para Android)
bun run mobile:eas-build --platform android --profile preview
```

#### Build para produção

```bash
# Build para Google Play
bun run mobile:eas-build --platform android --profile production

# Build para App Store
bun run mobile:eas-build --platform ios --profile production
```

## 4. Comandos do Monorepo

| Comando | Descrição |
|---------|-----------|
| `bun install` | Instala todas as dependências |
| `bun run web` | Executa o app web em modo de desenvolvimento |
| `bun run mobile` | Executa o app mobile em modo de desenvolvimento |
| `bun run core:build` | Compila o pacote core |
| `bun run web:build` | Compila o app web para produção |
| `bun run mobile:build` | Gera o bundle para o app mobile |
| `bun run mobile:eas-build` | Gera builds nativos do app mobile |
| `bun run build` | Compila core + web |
| `bun run clean` | Limpa pastas de build |

## 5. Workflow de Deploy Contínuo

### Staging

1. Faça push para a branch `staging`
2. Deploy automático na Vercel (staging)
3. Build automático do app mobile (preview)

### Produção

1. Faça push para a branch `main` ou crie uma tag
2. Deploy automático na Vercel (production)
3. Build automático do app mobile (production)
4. Submeta manualmente para as lojas:
   ```bash
   eas submit --platform android
   eas submit --platform ios
   ```

## 6. Troubleshooting

- **Erro no build do core**: Verifique o `tsconfig.json` e certifique-se de que as dependências estão instaladas
- **Erro no deploy web**: Verifique as variáveis de ambiente na Vercel
- **Erro no build mobile**: Execute `eas build:clean` e tente novamente

---

Para mais informações, consulte a documentação oficial:
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Expo EAS Build](https://docs.expo.dev/build/introduction/) 