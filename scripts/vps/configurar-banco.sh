#!/bin/bash

# Script de Configuração do Banco de Dados
# Este script cria o banco de dados e usuário para a aplicação

set -e

echo "🗄️  Configurando banco de dados..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Solicitar informações do banco
read -p "Nome do banco de dados [ekklesia]: " DB_NAME
DB_NAME=${DB_NAME:-ekklesia}

read -p "Nome do usuário do banco [ekklesia_user]: " DB_USER
DB_USER=${DB_USER:-ekklesia_user}

read -sp "Senha do usuário do banco: " DB_PASSWORD
echo ""

read -p "Host do MySQL [localhost]: " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Porta do MySQL [3306]: " DB_PORT
DB_PORT=${DB_PORT:-3306}

# Solicitar senha root do MySQL
read -sp "Senha root do MySQL (deixe em branco se não tiver): " MYSQL_ROOT_PASSWORD
echo ""

# Construir comando MySQL
if [ -z "$MYSQL_ROOT_PASSWORD" ]; then
    MYSQL_CMD="mysql"
else
    MYSQL_CMD="mysql -p$MYSQL_ROOT_PASSWORD"
fi

print_info "Criando banco de dados e usuário..."

# Criar banco de dados
$MYSQL_CMD <<EOF
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
EOF

if [ $? -eq 0 ]; then
    print_success "Banco de dados '${DB_NAME}' criado com sucesso"
    print_success "Usuário '${DB_USER}' criado com sucesso"
else
    print_error "Erro ao criar banco de dados"
    exit 1
fi

# Gerar DATABASE_URL
DATABASE_URL="mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo ""
print_info "DATABASE_URL gerada:"
echo "DATABASE_URL=\"${DATABASE_URL}\""
echo ""

# Salvar em arquivo temporário para uso posterior
mkdir -p /tmp/ekklesia-deploy
echo "DATABASE_URL=\"${DATABASE_URL}\"" > /tmp/ekklesia-deploy/database.env

print_success "Configuração do banco de dados concluída!"
print_info "As informações foram salvas em /tmp/ekklesia-deploy/database.env"

