# 🎯 Próximos Passos - Execute no Terminal

O Xcode já está em `/Applications` e configurado! Agora execute estes comandos:

## 1️⃣ Configurar Xcode (precisa de senha)

Execute no terminal:

```bash
# Executar primeira configuração do Xcode
sudo xcodebuild -runFirstLaunch

# Aceitar licença (se necessário)
sudo xcodebuild -license accept
```

---

## 2️⃣ Instalar CocoaPods (precisa de senha)

```bash
sudo gem install cocoapods
```

Se der erro de permissão, use:
```bash
sudo gem install -n /usr/local/bin cocoapods
```

---

## 3️⃣ Configurar Android SDK

### 3.1 Adicionar variáveis ao ~/.zshrc

Execute no terminal:

```bash
# Adicionar configurações do Android
cat >> ~/.zshrc << 'EOF'

# Android SDK
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
EOF

# Recarregar configurações
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

(Pressione `y` para aceitar todas)

---

## 4️⃣ Instalar Dependências iOS

```bash
cd mobile/ios
pod install
cd ../..
```

---

## 5️⃣ Verificar Tudo

Após executar todos os comandos:

```bash
flutter doctor -v
```

---

## ✅ Checklist

- [x] Xcode movido para `/Applications`
- [x] Xcode configurado (`xcode-select`)
- [ ] Xcode primeira execução (`xcodebuild -runFirstLaunch`)
- [ ] CocoaPods instalado
- [ ] Variáveis Android configuradas
- [ ] Java JDK instalado
- [ ] Licenças Android aceitas
- [ ] Dependências iOS instaladas

---

**Execute os comandos acima e me avise quando terminar!**





