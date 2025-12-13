# 🔧 Configuração Final - Comandos para Executar

## ⚠️ IMPORTANTE: Execute estes comandos no terminal

Alguns comandos precisam de senha de administrador. Execute um por vez.

---

## 1️⃣ Configurar Xcode

O Xcode está em `/Users/apple/Downloads/Xcode.app`. Precisamos movê-lo para `/Applications`:

```bash
# 1. Fechar o Xcode se estiver aberto
# (Cmd+Q ou sair do aplicativo)

# 2. Mover Xcode para Applications
sudo mv /Users/apple/Downloads/Xcode.app /Applications/

# 3. Configurar Xcode como ferramenta padrão
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

# 4. Executar primeira configuração
sudo xcodebuild -runFirstLaunch

# 5. Aceitar licença (se necessário)
sudo xcodebuild -license accept
```

---

## 2️⃣ Instalar CocoaPods

```bash
sudo gem install cocoapods
```

**Nota:** Se der erro de permissão, use:
```bash
sudo gem install -n /usr/local/bin cocoapods
```

---

## 3️⃣ Configurar Android SDK

### 3.1 Configurar variáveis de ambiente

Adicione ao seu `~/.zshrc`:

```bash
# Abrir arquivo
nano ~/.zshrc

# Adicionar estas linhas:
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# Salvar (Ctrl+O, Enter, Ctrl+X)
# Depois executar:
source ~/.zshrc
```

### 3.2 Instalar Java JDK

```bash
brew install openjdk@17
```

### 3.3 Aceitar licenças do Android

```bash
flutter doctor --android-licenses
```

(Pressione `y` para aceitar todas as licenças)

---

## 4️⃣ Instalar Dependências iOS

```bash
cd mobile/ios
pod install
cd ../..
```

---

## 5️⃣ Verificar Tudo

Após executar todos os comandos acima:

```bash
flutter doctor -v
```

Você deve ver:
- ✅ Flutter
- ✅ Android toolchain
- ✅ Xcode
- ✅ CocoaPods

---

## 📋 Checklist

- [ ] Xcode movido para `/Applications`
- [ ] Xcode configurado (`xcode-select --switch`)
- [ ] CocoaPods instalado
- [ ] Variáveis Android configuradas (`ANDROID_HOME`)
- [ ] Java JDK instalado
- [ ] Licenças Android aceitas
- [ ] Dependências iOS instaladas (`pod install`)
- [ ] `flutter doctor` mostra tudo OK

---

## 🚀 Após Configurar

Você poderá buildar:

### APK (Android):
```bash
cd mobile
flutter build apk --release
```

### IPA (iOS):
```bash
cd mobile
flutter build ios --release
```

---

**Execute os comandos acima e me avise quando terminar!**







