# ✅ Verificação de Requisitos para Build APK e IPA

## 📊 Status Atual

### ✅ Instalado e Funcionando:
- **Flutter:** ✅ Instalado (versão 3.38.4)
- **Sistema Operacional:** ✅ macOS (compatível com iOS e Android)
- **Dart:** ✅ Instalado (versão 3.10.3)

### ❌ Faltando para Android (APK):
- **Android SDK:** ❌ Não instalado
- **Java JDK:** ❌ Não instalado ou não configurado
- **Android Studio:** ❌ Não instalado (recomendado)

### ❌ Faltando para iOS (IPA):
- **Xcode:** ❌ Não instalado (só tem Command Line Tools)
- **CocoaPods:** ❌ Não instalado

---

## 🔧 Instalação dos Requisitos

### 1. Para Build Android (APK)

#### Opção A: Instalar Android Studio (Recomendado)

1. **Baixar Android Studio:**
   ```bash
   # Acesse: https://developer.android.com/studio
   # Ou via Homebrew:
   brew install --cask android-studio
   ```

2. **Abrir Android Studio e configurar:**
   - Na primeira abertura, ele vai instalar o Android SDK automaticamente
   - Aceite os termos e aguarde a instalação

3. **Configurar variáveis de ambiente:**
   
   Adicione ao seu `~/.zshrc` (ou `~/.bash_profile`):
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   ```

   Depois execute:
   ```bash
   source ~/.zshrc
   ```

4. **Instalar Java JDK:**
   ```bash
   # Via Homebrew
   brew install openjdk@17
   
   # Ou baixar de: https://www.oracle.com/java/technologies/downloads/
   ```

5. **Aceitar licenças do Android:**
   ```bash
   flutter doctor --android-licenses
   ```

#### Opção B: Instalar apenas Android SDK (sem Android Studio)

```bash
# Instalar via Homebrew
brew install --cask android-commandlinetools

# Configurar SDK
mkdir -p ~/Library/Android/sdk
sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"
```

---

### 2. Para Build iOS (IPA)

#### 1. Instalar Xcode

**⚠️ IMPORTANTE:** Xcode é grande (~15GB) e só está disponível na App Store do macOS.

1. **Abrir App Store**
2. **Buscar por "Xcode"**
3. **Instalar** (pode demorar bastante)
4. **Após instalar, executar:**
   ```bash
   sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
   sudo xcodebuild -runFirstLaunch
   ```

5. **Aceitar licença:**
   ```bash
   sudo xcodebuild -license accept
   ```

#### 2. Instalar CocoaPods

```bash
sudo gem install cocoapods
```

**Nota:** Se der erro de permissão, use:
```bash
sudo gem install -n /usr/local/bin cocoapods
```

#### 3. Instalar dependências do iOS

```bash
cd mobile/ios
pod install
cd ../..
```

---

## 📋 Checklist de Instalação

### Para Android (APK):
- [ ] Android Studio instalado OU Android SDK configurado
- [ ] Java JDK instalado (versão 11 ou 17)
- [ ] Variáveis de ambiente configuradas (`ANDROID_HOME`)
- [ ] Licenças do Android aceitas (`flutter doctor --android-licenses`)
- [ ] Flutter detecta Android SDK (`flutter doctor`)

### Para iOS (IPA):
- [ ] Xcode instalado da App Store
- [ ] Xcode Command Line Tools configurados
- [ ] CocoaPods instalado
- [ ] Dependências do iOS instaladas (`pod install`)
- [ ] Conta de desenvolvedor Apple configurada (para assinar o app)
- [ ] Flutter detecta Xcode (`flutter doctor`)

---

## 🧪 Verificar Instalação

Após instalar tudo, execute:

```bash
flutter doctor -v
```

Você deve ver:
- ✅ Flutter
- ✅ Android toolchain
- ✅ Xcode
- ✅ CocoaPods

---

## 🚀 Comandos de Build

### Build APK (Android):
```bash
cd mobile
flutter clean
flutter pub get
flutter build apk --release
```

### Build IPA (iOS):
```bash
cd mobile
flutter clean
flutter pub get
flutter build ios --release
```

**Nota:** Para gerar o `.ipa` instalável, você precisa:
1. Abrir o projeto no Xcode: `open mobile/ios/Runner.xcworkspace`
2. Configurar assinatura de código (Code Signing)
3. Selecionar dispositivo ou "Any iOS Device"
4. Product → Archive
5. Distribuir App

---

## ⚠️ Requisitos Adicionais para iOS

### Conta de Desenvolvedor Apple

Para assinar e distribuir apps iOS, você precisa:

1. **Apple ID gratuito:**
   - Permite testar no seu próprio dispositivo
   - Não permite publicar na App Store
   - Válido por 7 dias

2. **Conta de Desenvolvedor Apple ($99/ano):**
   - Permite publicar na App Store
   - Certificados válidos por 1 ano
   - TestFlight para testes

### Configurar Assinatura no Xcode:

1. Abrir: `open mobile/ios/Runner.xcworkspace`
2. Selecionar projeto "Runner" no navegador
3. Aba "Signing & Capabilities"
4. Selecionar seu "Team" (Apple ID)
5. Xcode vai gerar certificados automaticamente

---

## 📝 Resumo Rápido

### Para APK (Android):
```bash
# 1. Instalar Android Studio
brew install --cask android-studio

# 2. Configurar variáveis (adicionar ao ~/.zshrc)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# 3. Instalar Java
brew install openjdk@17

# 4. Aceitar licenças
flutter doctor --android-licenses

# 5. Verificar
flutter doctor
```

### Para IPA (iOS):
```bash
# 1. Instalar Xcode da App Store (manual)

# 2. Configurar Xcode
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -runFirstLaunch

# 3. Instalar CocoaPods
sudo gem install cocoapods

# 4. Instalar dependências
cd mobile/ios && pod install && cd ../..

# 5. Verificar
flutter doctor
```

---

## 🆘 Problemas Comuns

### "Unable to locate Android SDK"
- Verificar se `ANDROID_HOME` está configurado
- Verificar se Android Studio foi aberto pelo menos uma vez
- Executar: `flutter config --android-sdk ~/Library/Android/sdk`

### "Xcode installation is incomplete"
- Verificar se Xcode está instalado: `ls /Applications/Xcode.app`
- Executar: `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer`
- Executar: `sudo xcodebuild -runFirstLaunch`

### "CocoaPods not installed"
- Instalar: `sudo gem install cocoapods`
- Se der erro, usar: `sudo gem install -n /usr/local/bin cocoapods`

### "Java not found"
- Instalar: `brew install openjdk@17`
- Configurar: `export JAVA_HOME=$(/usr/libexec/java_home -v 17)`

---

**Última verificação:** $(date)

