#!/bin/bash

# Script de Instalação de Dependências - Ekklesia
# Este script instala todas as dependências necessárias para o projeto

set -e

echo "🚀 Iniciando instalação de dependências do projeto Ekklesia..."
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Verificar e instalar Homebrew
echo "📦 Verificando Homebrew..."
if ! command_exists brew; then
    echo -e "${YELLOW}Homebrew não encontrado. Instalando...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Adicionar Homebrew ao PATH (para Apple Silicon Macs)
    if [[ -f "/opt/homebrew/bin/brew" ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
else
    echo -e "${GREEN}✅ Homebrew já está instalado${NC}"
fi

# 2. Verificar e instalar Flutter
echo ""
echo "📱 Verificando Flutter..."
if ! command_exists flutter; then
    echo -e "${YELLOW}Flutter não encontrado. Instalando via Homebrew...${NC}"
    brew install --cask flutter
    
    # Adicionar Flutter ao PATH se necessário
    if [[ -d "$HOME/flutter/bin" ]]; then
        echo 'export PATH="$PATH:$HOME/flutter/bin"' >> ~/.zshrc
        export PATH="$PATH:$HOME/flutter/bin"
    fi
else
    echo -e "${GREEN}✅ Flutter já está instalado${NC}"
    flutter --version
fi

# 3. Verificar e instalar CocoaPods
echo ""
echo "🍎 Verificando CocoaPods..."
if ! command_exists pod; then
    echo -e "${YELLOW}CocoaPods não encontrado. Instalando...${NC}"
    echo -e "${YELLOW}Você precisará inserir sua senha de administrador${NC}"
    sudo gem install cocoapods
else
    echo -e "${GREEN}✅ CocoaPods já está instalado${NC}"
    pod --version
fi

# 4. Instalar dependências do Next.js (já feito, mas verificando)
echo ""
echo "⚛️  Verificando dependências do Next.js..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ Dependências do Next.js já instaladas${NC}"
else
    echo -e "${YELLOW}Instalando dependências do Next.js...${NC}"
    npm install
fi

# 5. Instalar dependências do Flutter
echo ""
echo "📦 Instalando dependências do Flutter..."
cd mobile
if flutter pub get; then
    echo -e "${GREEN}✅ Dependências do Flutter instaladas com sucesso${NC}"
else
    echo -e "${RED}❌ Erro ao instalar dependências do Flutter${NC}"
    exit 1
fi

# 6. Instalar dependências do iOS (CocoaPods)
echo ""
echo "🍎 Instalando dependências do iOS (CocoaPods)..."
cd ios
if pod install; then
    echo -e "${GREEN}✅ Dependências do iOS instaladas com sucesso${NC}"
else
    echo -e "${YELLOW}⚠️  Aviso: Alguns erros podem ter ocorrido ao instalar pods${NC}"
    echo -e "${YELLOW}   Isso pode ser normal se você ainda não configurou o Xcode${NC}"
fi

# 7. Voltar ao diretório raiz
cd ../..

# 8. Verificar instalação com Flutter Doctor
echo ""
echo "🔍 Verificando instalação com Flutter Doctor..."
echo -e "${YELLOW}Isso pode levar alguns minutos...${NC}"
flutter doctor

echo ""
echo -e "${GREEN}✨ Instalação concluída!${NC}"
echo ""
echo "Próximos passos:"
echo "1. Configure o Xcode se ainda não tiver feito"
echo "2. Execute 'flutter doctor' para verificar se tudo está OK"
echo "3. Para executar o app: cd mobile && flutter run"
echo ""

