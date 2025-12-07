# Guia de Instalação de Dependências - Ekklesia

Este guia irá ajudá-lo a instalar todas as dependências necessárias para o projeto, incluindo as dependências para desenvolvimento iOS.

## Status da Instalação

✅ **Dependências do Next.js** - Instaladas com sucesso!  
✅ **Xcode Command Line Tools** - Já instalado!

## 🚀 Quick Start - Comandos Rápidos

Execute estes comandos na ordem (alguns pedirão sua senha):

```bash
# 1. Instalar Homebrew (se ainda não tiver)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. Instalar Flutter
brew install --cask flutter

# 3. Instalar CocoaPods (pedirá sua senha)
sudo gem install cocoapods

# 4. Instalar dependências Flutter
cd /Users/apple/Desktop/apps/ekklesia/mobile
flutter pub get

# 5. Instalar dependências iOS
cd ios
pod install

# 6. Verificar instalação
cd ..
flutter doctor
```

## Próximos Passos (Detalhado)

### 1. Instalar Flutter SDK

O Flutter é necessário para desenvolvimento do aplicativo mobile.

#### Opção A: Instalação via Homebrew (Recomendado)

```bash
# Instalar Homebrew (se ainda não tiver)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar Flutter
brew install --cask flutter
```

#### Opção B: Instalação Manual

1. Baixe o Flutter SDK:
   ```bash
   cd ~
   git clone https://github.com/flutter/flutter.git -b stable
   ```

2. Adicione Flutter ao PATH:
   ```bash
   # Adicione esta linha ao seu ~/.zshrc ou ~/.bash_profile
   export PATH="$PATH:$HOME/flutter/bin"
   
   # Recarregue o shell
   source ~/.zshrc
   ```

3. Verifique a instalação:
   ```bash
   flutter doctor
   ```

### 2. Instalar CocoaPods (para iOS)

CocoaPods é necessário para gerenciar dependências nativas do iOS.

```bash
sudo gem install cocoapods
```

**Nota:** Você precisará inserir sua senha de administrador.

### 3. Instalar Dependências do Flutter

Após instalar o Flutter, execute:

```bash
cd mobile
flutter pub get
```

### 4. Instalar Dependências do iOS (CocoaPods)

Após instalar o CocoaPods, execute:

```bash
cd mobile/ios
pod install
```

### 5. Verificar Instalação Completa

Execute o Flutter Doctor para verificar se tudo está configurado:

```bash
flutter doctor
```

O comando deve mostrar:
- ✅ Flutter instalado
- ✅ Xcode instalado (necessário para iOS)
- ✅ CocoaPods instalado
- ✅ Ferramentas Android (opcional, se quiser desenvolver para Android também)

## Comandos Rápidos de Instalação

Execute estes comandos na ordem:

```bash
# 1. Instalar Flutter (se ainda não tiver)
brew install --cask flutter

# 2. Instalar CocoaPods
sudo gem install cocoapods

# 3. Instalar dependências Flutter
cd /Users/apple/Desktop/apps/ekklesia/mobile
flutter pub get

# 4. Instalar dependências iOS
cd ios
pod install

# 5. Verificar instalação
cd /Users/apple/Desktop/apps/ekklesia/mobile
flutter doctor
```

## Requisitos Adicionais para iOS

Para desenvolver para iOS, você também precisa:

1. **Xcode** - Instale via App Store
2. **Xcode Command Line Tools**:
   ```bash
   xcode-select --install
   ```
3. **Aceitar licença do Xcode**:
   ```bash
   sudo xcodebuild -license accept
   ```

## Solução de Problemas

### Erro: "Flutter command not found"
- Certifique-se de que o Flutter está no PATH
- Recarregue o terminal: `source ~/.zshrc`

### Erro: "pod: command not found"
- Verifique se CocoaPods foi instalado: `gem list cocoapods`
- Tente instalar novamente: `sudo gem install cocoapods`

### Erro ao executar `pod install`
- Certifique-se de estar no diretório `mobile/ios`
- Tente limpar o cache: `pod cache clean --all && pod install`

## Próximos Passos Após Instalação

1. Configure o ambiente de desenvolvimento
2. Execute o app em um simulador iOS:
   ```bash
   cd mobile
   flutter run
   ```
3. Ou abra no Xcode:
   ```bash
   cd mobile/ios
   open Runner.xcworkspace
   ```

