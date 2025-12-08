#!/bin/bash

# Script de Provisionamento Inicial da VPS
# Este script instala todas as dependências necessárias para rodar a aplicação Ekklesia

set -e

echo "🚀 Iniciando provisionamento da VPS para Ekklesia..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir mensagens
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    print_error "Por favor, execute como root (use sudo)"
    exit 1
fi

# 1. Atualizar sistema
print_info "Atualizando sistema..."
apt update && apt upgrade -y
print_success "Sistema atualizado"

# 2. Instalar Node.js 18+
print_info "Instalando Node.js 18..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        print_success "Node.js já instalado (versão $(node -v))"
    else
        print_info "Node.js versão antiga detectada, atualizando..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    fi
else
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi
print_success "Node.js instalado: $(node -v)"
print_success "NPM instalado: $(npm -v)"

# 3. Instalar Nginx
print_info "Instalando Nginx..."
if command -v nginx &> /dev/null; then
    print_success "Nginx já instalado"
else
    apt install nginx -y
    systemctl enable nginx
    systemctl start nginx
    print_success "Nginx instalado e iniciado"
fi

# 4. Instalar MySQL
print_info "Instalando MySQL..."
if command -v mysql &> /dev/null; then
    print_success "MySQL já instalado"
else
    apt install mysql-server -y
    systemctl enable mysql
    systemctl start mysql
    print_success "MySQL instalado e iniciado"
    
    # Configurar segurança básica do MySQL
    print_info "Configurando segurança do MySQL..."
    mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '';" 2>/dev/null || true
    mysql -e "DELETE FROM mysql.user WHERE User='';" 2>/dev/null || true
    mysql -e "DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');" 2>/dev/null || true
    mysql -e "DROP DATABASE IF EXISTS test;" 2>/dev/null || true
    mysql -e "DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';" 2>/dev/null || true
    mysql -e "FLUSH PRIVILEGES;" 2>/dev/null || true
    print_success "Segurança do MySQL configurada"
fi

# 5. Instalar PM2 globalmente
print_info "Instalando PM2..."
if command -v pm2 &> /dev/null; then
    print_success "PM2 já instalado"
else
    npm install -g pm2
    print_success "PM2 instalado"
fi

# 6. Instalar Certbot para SSL
print_info "Instalando Certbot (Let's Encrypt)..."
if command -v certbot &> /dev/null; then
    print_success "Certbot já instalado"
else
    apt install certbot python3-certbot-nginx -y
    print_success "Certbot instalado"
fi

# 7. Configurar Firewall (UFW)
print_info "Configurando firewall..."
if command -v ufw &> /dev/null; then
    ufw --force enable
    ufw allow 22/tcp   # SSH
    ufw allow 80/tcp   # HTTP
    ufw allow 443/tcp  # HTTPS
    print_success "Firewall configurado (portas 22, 80, 443 abertas)"
else
    apt install ufw -y
    ufw --force enable
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    print_success "UFW instalado e configurado"
fi

# 8. Instalar ferramentas úteis
print_info "Instalando ferramentas úteis..."
apt install -y git curl wget build-essential
print_success "Ferramentas instaladas"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_success "Provisionamento inicial concluído!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Execute: ./scripts/vps/configurar-banco.sh"
echo "   2. Configure o domínio apontando para este servidor"
echo "   3. Execute: ./scripts/vps/configurar-nginx.sh <seu-dominio.com>"
echo "   4. Execute: ./scripts/vps/configurar-ssl.sh <seu-dominio.com>"
echo "   5. Execute: ./scripts/vps/deploy.sh"
echo ""

