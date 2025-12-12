# ✅ Resumo: Configuração do App Mobile para enord.app

## 🎯 Configurações Aplicadas

Todas as configurações foram atualizadas para o domínio **enord.app**:

### ✅ Arquivos Atualizados

1. **`mobile/lib/services/config_service.dart`**
   - URL padrão: `https://enord.app`
   - Funciona para web e mobile

2. **`mobile/android/app/src/main/res/xml/network_security_config.xml`**
   - Apenas HTTPS permitido
   - Domínio `enord.app` configurado

3. **`mobile/android/app/src/main/AndroidManifest.xml`**
   - Removido `usesCleartextTraffic="true"`
   - Configuração de segurança de rede ativa

4. **Documentação atualizada**
   - `CHECKLIST_APP_MOBILE_VPS.md`
   - `GUIA_DEPLOY_VPS.md`
   - `mobile/GERAR_APK_PRODUCAO.md`
   - `mobile/INSTRUCOES_GERAR_APK.md`

## 🚀 Gerar APK

### Pré-requisitos

1. **Flutter instalado** (versão 3.x ou superior)
   - Download: https://docs.flutter.dev/get-started/install
   - Verificar: `flutter --version`

2. **Android SDK configurado**
   - Android Studio ou SDK standalone

3. **Java JDK instalado**

### Comandos para Gerar APK

```bash
# 1. Ir para o diretório do app mobile
cd mobile

# 2. Verificar se Flutter está instalado
flutter --version

# 3. Limpar build anterior
flutter clean

# 4. Obter dependências
flutter pub get

# 5. Gerar APK de release
flutter build apk --release

# OU gerar APK split (menor tamanho)
flutter build apk --split-per-abi --release
```

### Usar o Script Automatizado

```bash
cd mobile
./build-apk.sh
```

O script verifica tudo automaticamente e gera o APK.

## 📦 Localização do APK

Após o build, o APK estará em:
```
mobile/build/app/outputs/flutter-apk/app-release.apk
```

Para APK split:
```
mobile/build/app/outputs/flutter-apk/app-arm64-v8a-release.apk (64-bit - recomendado)
mobile/build/app/outputs/flutter-apk/app-armeabi-v7a-release.apk (32-bit)
```

## 🔍 Verificação

### Verificar Configuração

1. **URL da API:**
   ```bash
   grep "enord.app" mobile/lib/services/config_service.dart
   # Deve mostrar: return 'https://enord.app';
   ```

2. **Segurança de Rede:**
   ```bash
   grep "enord.app" mobile/android/app/src/main/res/xml/network_security_config.xml
   # Deve mostrar: <domain includeSubdomains="true">enord.app</domain>
   ```

3. **AndroidManifest:**
   ```bash
   grep "usesCleartextTraffic" mobile/android/app/src/main/AndroidManifest.xml
   # NÃO deve encontrar nada (removido)
   ```

## 📱 Instalar e Testar

### Instalar APK

```bash
# Via ADB (dispositivo conectado)
adb install mobile/build/app/outputs/flutter-apk/app-release.apk

# OU copiar manualmente para o dispositivo e instalar
```

### Testar

1. Abra o app "Ekklesia - Membros"
2. Tente fazer login com credenciais de um membro
3. Verifique se consegue acessar as funcionalidades

**⚠️ Importante:** A igreja do membro precisa ter o módulo `MOBILE_APP` ativo!

## ✅ Checklist Final

- [x] URL da API configurada: `https://enord.app`
- [x] Segurança de rede: Apenas HTTPS
- [x] Domínio configurado: `enord.app`
- [x] HTTP desabilitado
- [ ] Flutter instalado e no PATH
- [ ] APK gerado
- [ ] APK testado no dispositivo

## 🐛 Se Flutter Não Estiver Instalado

### Instalar Flutter (macOS)

```bash
# 1. Baixar Flutter
cd ~
git clone https://github.com/flutter/flutter.git -b stable

# 2. Adicionar ao PATH
export PATH="$PATH:$HOME/flutter/bin"

# 3. Verificar instalação
flutter doctor
```

### Ou usar Homebrew

```bash
brew install --cask flutter
```

---

**Domínio configurado:** `https://enord.app`  
**Status:** ✅ Configurações aplicadas, pronto para gerar APK
