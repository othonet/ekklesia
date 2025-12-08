#!/bin/bash

# Script para Redefinir Senha do MySQL

set -e

echo "🔐 Redefinir Senha do MySQL"
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

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    print_error "Execute como root (use sudo)"
    exit 1
fi

read -p "Qual usuário deseja redefinir? [root]: " MYSQL_USER
MYSQL_USER=${MYSQL_USER:-root}

read -sp "Nova senha: " NEW_PASSWORD
echo ""

read -sp "Confirme a senha: " CONFIRM_PASSWORD
echo ""

if [ "$NEW_PASSWORD" != "$CONFIRM_PASSWORD" ]; then
    print_error "Senhas não coincidem!"
    exit 1
fi

if [ -z "$NEW_PASSWORD" ]; then
    print_error "Senha não pode ser vazia!"
    exit 1
fi

print_info "Verificando status do MySQL..."
if systemctl is-active --quiet mysql || systemctl is-active --quiet mysqld; then
    print_info "Parando MySQL..."
    systemctl stop mysql 2>/dev/null || systemctl stop mysqld 2>/dev/null
    sleep 2
fi

print_info "Verificando se MySQL está realmente parado..."
if pgrep mysqld > /dev/null; then
    print_info "Forçando parada de processos MySQL..."
    pkill -9 mysqld 2>/dev/null || true
    sleep 2
fi

print_info "Iniciando MySQL em modo seguro..."
# Tentar diferentes métodos de inicialização
if command -v mysqld_safe > /dev/null; then
    mysqld_safe --skip-grant-tables --skip-networking --user=mysql > /tmp/mysqld_safe.log 2>&1 &
    MYSQL_SAFE_PID=$!
elif command -v mysqld > /dev/null; then
    mysqld --skip-grant-tables --skip-networking --user=mysql > /tmp/mysqld_safe.log 2>&1 &
    MYSQL_SAFE_PID=$!
else
    print_error "mysqld_safe ou mysqld não encontrado!"
    exit 1
fi

print_info "Aguardando MySQL iniciar..."
# Aguardar até MySQL estar pronto (máximo 30 segundos)
for i in {1..30}; do
    if mysql -u root -e "SELECT 1;" > /dev/null 2>&1; then
        break
    fi
    sleep 1
done

# Verificar se MySQL está rodando
if ! mysql -u root -e "SELECT 1;" > /dev/null 2>&1; then
    print_error "MySQL não iniciou em modo seguro"
    print_info "Logs:"
    tail -20 /tmp/mysqld_safe.log 2>/dev/null || echo "Sem logs disponíveis"
    kill $MYSQL_SAFE_PID 2>/dev/null || true
    exit 1
fi

print_info "Redefinindo senha..."
mysql -u root << SQL
USE mysql;
FLUSH PRIVILEGES;
ALTER USER '$MYSQL_USER'@'localhost' IDENTIFIED WITH mysql_native_password BY '$NEW_PASSWORD';
FLUSH PRIVILEGES;
SQL

if [ $? -eq 0 ]; then
    print_success "Senha redefinida!"
else
    print_error "Erro ao redefinir senha"
    kill $MYSQL_SAFE_PID 2>/dev/null || true
    exit 1
fi

print_info "Parando MySQL em modo seguro..."
kill $MYSQL_SAFE_PID 2>/dev/null || true
pkill mysqld_safe 2>/dev/null || true
pkill mysqld 2>/dev/null || true
sleep 3

print_info "Iniciando MySQL normalmente..."
if systemctl start mysql 2>/dev/null || systemctl start mysqld 2>/dev/null; then
    sleep 3
    if systemctl is-active --quiet mysql || systemctl is-active --quiet mysqld; then
        print_success "MySQL iniciado normalmente"
    else
        print_error "MySQL não iniciou normalmente"
        print_info "Tentando iniciar manualmente..."
        mysqld_safe --user=mysql > /dev/null 2>&1 &
        sleep 3
    fi
else
    print_error "Erro ao iniciar MySQL via systemctl"
    print_info "Tentando iniciar manualmente..."
    mysqld_safe --user=mysql > /dev/null 2>&1 &
    sleep 3
fi

print_info "Testando nova senha..."
if mysql -u "$MYSQL_USER" -p"$NEW_PASSWORD" -e "SELECT 1;" > /dev/null 2>&1; then
    print_success "Senha redefinida e testada com sucesso!"
    echo ""
    print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_info "Nova DATABASE_URL:"
    echo "mysql://${MYSQL_USER}:${NEW_PASSWORD}@localhost:3306/ekklesia"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
    echo "   1. Atualize o secret DATABASE_URL no GitHub"
    echo "   2. Se tiver .env na VPS, atualize também"
    print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    print_error "Erro ao testar nova senha"
    exit 1
fi
