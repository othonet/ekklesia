# 📊 Status dos Requisitos para Build

## ✅ O que você JÁ TEM:

- ✅ **Flutter 3.38.4** - Instalado e funcionando
- ✅ **Dart 3.10.3** - Instalado
- ✅ **macOS** - Sistema compatível com iOS e Android

---

## ❌ O que FALTA para Android (APK):

### 1. Android SDK
- **Status:** ❌ Não instalado
- **Solução:** Instalar Android Studio (recomendado) ou Android SDK

### 2. Java JDK
- **Status:** ❌ Não instalado
- **Solução:** `brew install openjdk@17`

### 3. Licenças Android
- **Status:** ⏳ Aguardando instalação do SDK
- **Solução:** `flutter doctor --android-licenses` (após instalar SDK)

---

## ❌ O que FALTA para iOS (IPA):

### 1. Xcode Completo
- **Status:** ❌ Não instalado (só tem Command Line Tools)
- **Solução:** Instalar Xcode da App Store (~15GB)

### 2. CocoaPods
- **Status:** ❌ Não instalado
- **Solução:** `sudo gem install cocoapods`

### 3. Dependências iOS
- **Status:** ⏳ Aguardando CocoaPods
- **Solução:** `cd mobile/ios && pod install`

---

## 🚀 Instalação Rápida

### Para APK (Android):

```bash
# 1. Instalar Android Studio
brew install --cask android-studio

# 2. Abrir Android Studio uma vez para instalar SDK

# 3. Configurar variáveis (adicionar ao ~/.zshrc)
cat >> ~/.zshrc << 'EOF'
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
EOF
source ~/.zshrc

# 4. Instalar Java
brew install openjdk@17

# 5. Aceitar licenças
flutter doctor --android-licenses
```

### Para IPA (iOS):

```bash
# 1. Instalar Xcode da App Store (MANUAL - ~15GB)

# 2. Após instalar Xcode:
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -runFirstLaunch

# 3. Instalar CocoaPods
sudo gem install cocoapods

# 4. Instalar dependências
cd mobile/ios
pod install
cd ../..
```

---

## 📋 Verificação Final

Após instalar tudo, execute:

```bash
flutter doctor -v
```

Você deve ver todos os itens com ✅ (verde).

---

## ⏱️ Tempo Estimado de Instalação

- **Android Studio:** ~30 minutos (download + instalação)
- **Xcode:** ~1-2 horas (depende da conexão, ~15GB)
- **Configuração:** ~10 minutos

**Total:** ~2-3 horas (principalmente aguardando downloads)

---

## 💡 Dica

Se você só precisa do **APK por enquanto**, pode instalar apenas o Android SDK e deixar o Xcode para depois. O iOS pode ser feito em outro momento.

---

**Documentação completa:** `VERIFICACAO_REQUISITOS_BUILD.md`

