# 🔨 Rebuild do APK - Passo a Passo

## Por que precisa rebuild?

O APK instalado foi gerado **antes** de implementarmos:
- ✅ Tela de Configurações da API
- ✅ URL dinâmica (ConfigService)
- ✅ Atualização automática da URL

O app antigo pode estar usando uma URL hardcoded que não funciona.

## 📋 Passos para Rebuild

### 1. Verificar URL Padrão

Edite `mobile/lib/services/config_service.dart` e confirme:

```dart
static const String _defaultApiUrl = 'http://192.168.1.161:3000';
```

**Deve estar exatamente assim!**

### 2. Limpar o Projeto

```bash
cd mobile
flutter clean
```

### 3. Instalar Dependências

```bash
flutter pub get
```

### 4. Gerar o APK

```bash
flutter build apk --release
```

### 5. Instalar o Novo APK

1. **Localização do APK:**
   - `mobile/build/app/outputs/flutter-apk/app-release.apk`

2. **Copiar para o celular:**
   - Via USB, email, ou nuvem

3. **Desinstalar a versão antiga:**
   - Configurações → Apps → Ekklesia → Desinstalar

4. **Instalar a nova versão:**
   - Abra o arquivo APK no celular
   - Permita instalação de fontes desconhecidas se solicitado
   - Instale

5. **Testar:**
   - Abra o app
   - Tente fazer login
   - Se necessário, configure a URL em "Configurações da API"

## ✅ Verificação

Após instalar o novo APK:

1. **Abra o app**
2. **Vá em "Configurações da API"** (botão na tela de login)
3. **Verifique a URL:** Deve estar `http://192.168.1.161:3000`
4. **Tente fazer login**

## 🐛 Se Ainda Não Funcionar

### Verificar Logs

Quando tentar fazer login, o app mostra logs. Procure por:

```
🔐 Tentando login com email: ...
🌐 URL Base: http://192.168.1.161:3000
🌐 URL Completa: http://192.168.1.161:3000/api/auth/member/login
```

**Se a URL estiver errada:**
- Configure na tela de Configurações
- Salve e tente novamente

**Se a URL estiver correta mas der erro:**
- Verifique os logs do servidor Next.js
- Pode ser problema de credenciais ou CORS

### Verificar Servidor

No terminal do servidor, você deve ver:

```
POST /api/auth/member/login
Body recebido: { email: '...', password: '***' }
```

**Se não aparecer nada:**
- A requisição não está chegando
- Verifique firewall ou rede

## 📝 Comandos Completos

```bash
# 1. Ir para o diretório mobile
cd mobile

# 2. Limpar
flutter clean

# 3. Instalar dependências
flutter pub get

# 4. Gerar APK
flutter build apk --release

# 5. O APK estará em:
# mobile/build/app/outputs/flutter-apk/app-release.apk
```

## 🎯 Resumo

1. ✅ Verificar URL padrão em `config_service.dart`
2. ✅ `flutter clean`
3. ✅ `flutter pub get`
4. ✅ `flutter build apk --release`
5. ✅ Desinstalar app antigo
6. ✅ Instalar novo APK
7. ✅ Testar login

