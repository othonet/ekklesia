#!/bin/bash

# Script Melhorado para Redefinir Senha do MySQL

set -e

echo "🔐 Redefinir Senha do MySQL (Versão Melhorada)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

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

# Verificar se MySQL está rodando
MYSQL_RUNNING=false
if systemctl is-active --quiet mysql 2>/dev/null || pgrep mysqld > /dev/null 2>&1; then
    MYSQL_RUNNING=true
    print_info "MySQL está rodando"
fi

# Método 1: Tentar resetar sem parar (se tiver acesso)
if [ "$MYSQL_RUNNING" = true ]; then
    print_info "Tentando método alternativo (sem parar MySQL)..."
    
    # Tentar usar mysqladmin se disponível
    if command -v mysqladmin > /dev/null; then
        print_info "Tentando resetar senha com mysqladmin..."
        if mysqladmin -u root password "$NEW_PASSWORD" 2>/dev/null; then
            print_success "Senha redefinida com mysqladmin!"
            MYSQL_USER="root"
            MYSQL_RESET=true
        fi
    fi
fi

# Método 2: Modo seguro (se método 1 não funcionou)
if [ "${MYSQL_RESET:-false}" != "true" ]; then
    print_info "Usando método de modo seguro..."
    
    # Parar MySQL
    if [ "$MYSQL_RUNNING" = true ]; then
        print_info "Parando MySQL..."
        systemctl stop mysql 2>/dev/null || true
        sleep 2
        
        # Garantir que parou
        if pgrep mysqld > /dev/null; then
            print_warning "Forçando parada de processos MySQL..."
            pkill -9 mysqld 2>/dev/null || true
            sleep 2
        fi
    fi
    
    # Criar diretório de socket se não existir
    mkdir -p /var/run/mysqld
    chown mysql:mysql /var/run/mysqld 2>/dev/null || true
    
    # Iniciar MySQL em modo seguro
    print_info "Iniciando MySQL em modo seguro..."
    
    # Tentar diferentes métodos
    if command -v mysqld_safe > /dev/null; then
        mysqld_safe --skip-grant-tables --skip-networking --user=mysql --datadir=/var/lib/mysql > /tmp/mysqld_safe.log 2>&1 &
        MYSQL_PID=$!
    else
        mysqld --skip-grant-tables --skip-networking --user=mysql --datadir=/var/lib/mysql > /tmp/mysqld_safe.log 2>&1 &
        MYSQL_PID=$!
    fi
    
    # Aguardar MySQL iniciar
    print_info "Aguardando MySQL iniciar (pode levar até 30 segundos)..."
    MYSQL_READY=false
    for i in {1..30}; do
        if mysql -u root -e "SELECT 1;" > /dev/null 2>&1; then
            MYSQL_READY=true
            break
        fi
        sleep 1
        echo -n "."
    done
    echo ""
    
    if [ "$MYSQL_READY" = false ]; then
        print_error "MySQL não iniciou em modo seguro"
        print_info "Últimas linhas do log:"
        tail -20 /tmp/mysqld_safe.log 2>/dev/null || echo "Sem logs disponíveis"
        kill $MYSQL_PID 2>/dev/null || true
        exit 1
    fi
    
    print_success "MySQL iniciado em modo seguro"
    
    # Redefinir senha
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
        kill $MYSQL_PID 2>/dev/null || true
        exit 1
    fi
    
    # Parar MySQL em modo seguro
    print_info "Parando MySQL em modo seguro..."
    kill $MYSQL_PID 2>/dev/null || true
    pkill mysqld_safe 2>/dev/null || true
    pkill mysqld 2>/dev/null || true
    sleep 3
fi

# Reiniciar MySQL normalmente
print_info "Iniciando MySQL normalmente..."
if systemctl start mysql 2>/dev/null; then
    sleep 3
    if systemctl is-active --quiet mysql; then
        print_success "MySQL iniciado normalmente"
    else
        print_error "MySQL não iniciou via systemctl"
        exit 1
    fi
else
    print_error "Erro ao iniciar MySQL via systemctl"
    exit 1
fi

# Testar nova senha
print_info "Testando nova senha..."
if mysql -u "$MYSQL_USER" -p"$NEW_PASSWORD" -e "SELECT 1;" > /dev/null 2>&1; then
    print_success "Senha redefinida e testada com sucesso!"
    echo ""
    print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    print_info "Nova DATABASE_URL:"
    echo "mysql://${MYSQL_USER}:${NEW_PASSWORD}@localhost:3306/ekklesia"
    echo ""
    print_warning "⚠️  IMPORTANTE:"
    echo "   1. Atualize o secret DATABASE_URL no GitHub"
    echo "   2. Se tiver .env na VPS, atualize também"
    print_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    print_error "Erro ao testar nova senha"
    print_info "Tente conectar manualmente:"
    echo "   mysql -u $MYSQL_USER -p"
    exit 1
fi

