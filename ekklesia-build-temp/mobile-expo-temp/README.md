# 📱 Ekklesia Mobile - Expo Go

Projeto mobile desenvolvido com Expo, otimizado para uso com Expo Go.

## 🚀 Como Usar

### Opção 1: Expo Go (Recomendado - Mais Fácil)

1. **Instale o Expo Go no seu celular:**
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Execute o projeto:**
   ```powershell
   npm start
   ```

3. **Escaneie o QR Code:**
   - **Android**: Use a câmera do Google ou abra o app Expo Go e escaneie
   - **iOS**: Use a câmera nativa do iPhone

### Opção 2: Emulador Android

1. **Crie um emulador no Android Studio:**
   - Abra Android Studio
   - Tools → Device Manager
   - Create Device
   - Escolha um dispositivo e imagem do sistema

2. **Execute:**
   ```powershell
   npm run android
   ```

### Opção 3: Dispositivo Físico via USB

1. **Ative Depuração USB no dispositivo**
2. **Conecte via USB**
3. **Execute:**
   ```powershell
   npm run android
   ```

## 📦 Scripts Disponíveis

- `npm start` - Inicia o Metro Bundler (para Expo Go)
- `npm run android` - Inicia no Android (emulador ou dispositivo)
- `npm run ios` - Inicia no iOS (apenas macOS)
- `npm run web` - Inicia na web

## 🔧 Configuração da API

O arquivo `src/constants/api.ts` está configurado para:
- **Android Emulator**: `http://10.0.2.2:3000/api`
- **iOS Simulator/Web**: `http://localhost:3000/api`
- **Dispositivo Físico**: Altere para o IP da sua máquina na rede local

## ✨ Vantagens do Expo Go

- ✅ Não precisa compilar
- ✅ Hot reload instantâneo
- ✅ Fácil testar em dispositivos reais
- ✅ Sem problemas de Java/Gradle
- ✅ Desenvolvimento rápido

## 🐛 Troubleshooting

### Erro: "No Android connected device found"

Use o **Expo Go** (Opção 1) - é mais fácil e não precisa de emulador!

### Erro: "Metro bundler não inicia"

```powershell
# Limpar cache
npx expo start -c
```

### Erro: "Dependências não encontradas"

```powershell
# Reinstalar dependências
Remove-Item -Recurse -Force node_modules
npm install
```

## 📝 Notas

- Este projeto usa Expo SDK 54
- Todas as dependências estão nas versões compatíveis
- O código está em `src/`
- Configurações em `app.json`

