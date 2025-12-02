# Guia para Compilar APK do App Ekklesia

## Pré-requisitos

1. **Conta Expo**: Você precisa ter uma conta no Expo. Se não tiver, crie em: https://expo.dev/signup

2. **EAS CLI**: O EAS CLI já está configurado no projeto.

## Passos para Compilar o APK

### 1. Fazer Login no EAS

Execute no terminal, dentro da pasta `mobile-expo-temp`:

```bash
npx eas-cli login
```

Você será solicitado a inserir seu email/username e senha da conta Expo.

### 2. Configurar o Project ID (se necessário)

Se ainda não tiver um project ID configurado, execute:

```bash
npx eas-cli init
```

Isso irá:
- Criar um projeto no EAS (se ainda não existir)
- Atualizar o `app.json` com o `projectId` correto

### 3. Compilar o APK

Execute um dos seguintes comandos:

**Para build de preview (APK para testes):**
```bash
npx eas-cli build --platform android --profile preview
```

**Para build de produção (APK para distribuição):**
```bash
npx eas-cli build --platform android --profile production
```

### 4. Aguardar o Build

O build será executado na nuvem do Expo. Você pode:
- Acompanhar o progresso no terminal
- Acessar https://expo.dev para ver o status do build

### 5. Baixar o APK

Após o build ser concluído:
- Você receberá um link para download do APK
- Ou pode baixar diretamente do dashboard do Expo em https://expo.dev

## Configurações Atuais

O arquivo `eas.json` já está configurado para gerar APK:
- **Preview**: APK para testes internos
- **Production**: APK para distribuição

## Alternativa: Build Local (Avançado)

Se preferir fazer o build localmente (requer Android Studio e mais configuração):

```bash
npx eas-cli build --platform android --profile preview --local
```

**Nota**: Build local requer mais configuração e pode ser mais lento.

## Troubleshooting

### Erro: "An Expo user account is required"
- Execute `npx eas-cli login` primeiro

### Erro: "Project ID not found"
- Execute `npx eas-cli init` para configurar o projeto

### Erro: "EPERM: operation not permitted, scandir"
Este erro ocorre quando o EAS tenta acessar pastas com permissões restritas no Windows.

**Soluções:**

1. **Verificar se está no diretório correto:**
   ```bash
   cd mobile-expo-temp
   pwd  # ou 'cd' no Windows
   ```

2. **Executar o build de um diretório temporário:**
   ```bash
   # Criar uma cópia limpa do projeto
   mkdir ..\ekklesia-build-temp
   xcopy /E /I /Y . ..\ekklesia-build-temp
   cd ..\ekklesia-build-temp\mobile-expo-temp
   npx eas-cli build --platform android --profile preview
   ```

3. **Usar build local (requer Android Studio):**
   ```bash
   npx eas-cli build --platform android --profile preview --local
   ```

4. **Verificar links simbólicos:**
   - Certifique-se de que não há links simbólicos apontando para fora do projeto
   - Verifique o arquivo `.easignore` para garantir que pastas problemáticas estão sendo ignoradas

5. **Executar como administrador (último recurso):**
   - Abra o terminal como administrador e tente novamente

### Build falha
- Verifique os logs no terminal ou no dashboard do Expo
- Certifique-se de que todas as dependências estão instaladas (`npm install`)
- Limpe o cache: `npx expo start --clear`

## Informações do Projeto

- **Nome**: Ekklesia
- **Slug**: ekklesia-mobile
- **Versão**: 1.0.0
- **Plataforma**: Android (APK)

