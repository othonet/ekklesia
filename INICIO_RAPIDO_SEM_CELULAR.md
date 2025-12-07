# ⚡ Início Rápido - Testar Sem Celular

## 🎯 Opção Mais Rápida: Flutter Web (Navegador)

### 1. Iniciar o servidor (em um terminal):
```powershell
npm run dev
```

### 2. Executar o app no navegador (em outro terminal):
```powershell
cd mobile
flutter run -d chrome
```

**Pronto!** O app abrirá automaticamente no Chrome. 🚀

---

## 📱 Outras Opções

### Emulador Android (Mais Realista)
1. Abra o Android Studio
2. Inicie um emulador (Device Manager → ▶️)
3. Execute:
```powershell
cd mobile
flutter run
```

### App Windows (Desktop)
```powershell
cd mobile
flutter run -d windows
```

### Usar o Script Helper
```powershell
# No navegador (mais rápido)
.\testar-app.ps1 web

# No emulador Android
.\testar-app.ps1 android

# Como app Windows
.\testar-app.ps1 windows
```

---

## 🔧 Configuração da URL da API

### Para Web/Windows (localhost):
Edite `mobile/lib/config/api_config.dart`:
```dart
static const String baseUrl = 'http://localhost:3000';
```

### Para Emulador Android:
```dart
static const String baseUrl = 'http://10.0.2.2:3000';
```

---

## 📊 Dispositivos Disponíveis

Você tem 3 opções disponíveis:
- ✅ **Chrome** (web) - Mais rápido
- ✅ **Edge** (web) - Alternativa
- ✅ **Windows** (desktop) - App nativo

Para ver emuladores Android:
```powershell
flutter emulators
```

---

## 🎯 Recomendação

**Para desenvolvimento rápido:** Use `flutter run -d chrome`
- Inicia em segundos
- Hot reload instantâneo
- Fácil de debugar

**Para testes finais:** Use emulador Android
- Mais próximo do dispositivo real
- Testa funcionalidades mobile específicas

---

## ✅ Checklist

- [ ] Servidor rodando (`npm run dev`)
- [ ] URL da API configurada corretamente
- [ ] Flutter instalado e configurado
- [ ] Executar: `flutter run -d chrome`

**Pronto para testar!** 🎉

