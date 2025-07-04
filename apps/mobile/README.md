# Carteira Mobile App

Este é o aplicativo mobile para o Carteira, construído com Expo.

## ▶️ Como Rodar

1.  **Instale as dependências:**
    Na raiz do monorepo, execute:
    ```bash
    pnpm install
    ```

2.  **Inicie o servidor de desenvolvimento:**
    A partir deste diretório (`apps/mobile`), execute um dos seguintes comandos:

    Para rodar no simulador iOS:
    ```bash
    pnpm run ios
    ```

    Para rodar no emulador Android:
    ```bash
    pnpm run android
    ```

    Você precisará ter o Xcode (para iOS) ou o Android Studio (para Android) instalado e configurado.

3.  **Escanear o QR Code:**
    Assim que o servidor estiver em execução, você pode escanear o QR code com o aplicativo Expo Go em seu dispositivo físico para rodar o app.

## 🧪 Testando o Login

O fluxo de login está mockado. Você pode usar qualquer e-mail e senha para entrar no aplicativo. A lógica de autenticação real será implementada futuramente. 