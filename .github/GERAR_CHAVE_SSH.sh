#!/bin/bash

# Script para gerar e configurar chave SSH para GitHub Actions

set -e

echo "🔑 Gerando chave SSH para GitHub Actions..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Nome da chave
KEY_NAME="github-actions-deploy"
KEY_PATH="$HOME/.ssh/$KEY_NAME"

# Verificar se chave já existe
if [ -f "$KEY_PATH" ]; then
    print_warning "Chave já existe em: $KEY_PATH"
    read -p "Deseja sobrescrever? (s/N): " OVERWRITE
    if [[ ! "$OVERWRITE" =~ ^[Ss]$ ]]; then
        print_info "Operação cancelada"
        exit 0
    fi
    rm -f "$KEY_PATH" "$KEY_PATH.pub"
fi

# Criar diretório .ssh se não existir
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Gerar chave SSH
print_info "Gerando chave SSH ed25519..."
ssh-keygen -t ed25519 -C "github-actions-deploy-ekklesia" -f "$KEY_PATH" -N ""

if [ $? -eq 0 ]; then
    print_success "Chave gerada com sucesso!"
else
    print_error "Erro ao gerar chave"
    exit 1
fi

# Ajustar permissões
chmod 600 "$KEY_PATH"
chmod 644 "$KEY_PATH.pub"

echo ""
print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_info "Chave gerada em: $KEY_PATH"
print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Mostrar chave pública
print_info "Chave PÚBLICA (copie para VPS):"
echo ""
cat "$KEY_PATH.pub"
echo ""
echo ""

# Solicitar informações da VPS
read -p "IP ou hostname da VPS (ex: 72.61.42.147): " VPS_HOST
read -p "Usuário SSH na VPS [root]: " VPS_USER
VPS_USER=${VPS_USER:-root}

if [ -z "$VPS_HOST" ]; then
    print_error "Host da VPS é obrigatório"
    exit 1
fi

# Perguntar se deseja copiar automaticamente
read -p "Deseja copiar a chave pública para a VPS automaticamente? (S/n): " COPY_KEY
COPY_KEY=${COPY_KEY:-S}

if [[ "$COPY_KEY" =~ ^[Ss]$ ]]; then
    print_info "Copiando chave pública para VPS..."
    
    # Tentar usar ssh-copy-id
    if command -v ssh-copy-id &> /dev/null; then
        ssh-copy-id -i "$KEY_PATH.pub" "$VPS_USER@$VPS_HOST"
    else
        # Método manual
        print_info "ssh-copy-id não encontrado, usando método manual..."
        cat "$KEY_PATH.pub" | ssh "$VPS_USER@$VPS_HOST" "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Chave pública copiada para VPS!"
    else
        print_warning "Não foi possível copiar automaticamente. Copie manualmente:"
        echo ""
        cat "$KEY_PATH.pub"
        echo ""
        print_info "Execute na VPS:"
        echo "  mkdir -p ~/.ssh"
        echo "  echo '$(cat $KEY_PATH.pub)' >> ~/.ssh/authorized_keys"
        echo "  chmod 700 ~/.ssh"
        echo "  chmod 600 ~/.ssh/authorized_keys"
    fi
else
    print_info "Pule a cópia automática. Copie manualmente a chave pública acima para a VPS."
fi

# Testar conexão
echo ""
read -p "Deseja testar a conexão SSH agora? (S/n): " TEST_CONN
TEST_CONN=${TEST_CONN:-S}

if [[ "$TEST_CONN" =~ ^[Ss]$ ]]; then
    print_info "Testando conexão SSH..."
    ssh -i "$KEY_PATH" -o BatchMode=yes -o ConnectTimeout=5 "$VPS_USER@$VPS_HOST" "echo 'Conexão SSH funcionando!'" 2>&1
    
    if [ $? -eq 0 ]; then
        print_success "Conexão SSH testada com sucesso!"
    else
        print_warning "Conexão falhou. Verifique se a chave pública foi copiada corretamente."
    fi
fi

# Mostrar chave privada
echo ""
print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_warning "CHAVE PRIVADA (adicione como secret no GitHub):"
print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
cat "$KEY_PATH"
echo ""
print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

print_info "Próximos passos:"
echo "1. Copie a chave PRIVADA acima (todo o conteúdo)"
echo "2. No GitHub: Settings → Secrets → Actions → New secret"
echo "3. Nome: VPS_SSH_PRIVATE_KEY"
echo "4. Cole o conteúdo da chave privada"
echo "5. Salve"
echo ""
print_success "Configuração concluída!"

