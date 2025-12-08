#!/bin/bash

# Script de Backup do Banco de Dados
# Este script cria um backup do banco de dados MySQL

set -e

echo "💾 Criando backup do banco de dados..."
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

# Carregar DATABASE_URL do .env.production ou .env
if [ -f ".env.production" ]; then
    source .env.production
elif [ -f ".env" ]; then
    source .env
else
    print_error "Arquivo .env não encontrado"
    exit 1
fi

# Extrair informações da DATABASE_URL
# Formato: mysql://user:password@host:port/database
if [[ $DATABASE_URL =~ mysql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASSWORD="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"
else
    print_error "DATABASE_URL inválida"
    exit 1
fi

# Criar diretório de backups
BACKUP_DIR="backups"
mkdir -p "$BACKUP_DIR"

# Nome do arquivo de backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/ekklesia_backup_${TIMESTAMP}.sql"
BACKUP_FILE_COMPRESSED="${BACKUP_FILE}.gz"

print_info "Fazendo backup do banco: ${DB_NAME}"

# Fazer backup
mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" \
    --single-transaction \
    --routines \
    --triggers \
    "$DB_NAME" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    print_success "Backup criado: ${BACKUP_FILE}"
    
    # Comprimir backup
    print_info "Comprimindo backup..."
    gzip "$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        print_success "Backup comprimido: ${BACKUP_FILE_COMPRESSED}"
        
        # Mostrar tamanho
        SIZE=$(du -h "$BACKUP_FILE_COMPRESSED" | cut -f1)
        print_info "Tamanho do backup: ${SIZE}"
        
        # Manter apenas os últimos 7 backups
        print_info "Removendo backups antigos (mantendo últimos 7)..."
        ls -t "$BACKUP_DIR"/ekklesia_backup_*.sql.gz | tail -n +8 | xargs -r rm
        print_success "Backup concluído!"
    else
        print_error "Erro ao comprimir backup"
        exit 1
    fi
else
    print_error "Erro ao criar backup"
    exit 1
fi

echo ""
print_info "Backups disponíveis:"
ls -lh "$BACKUP_DIR"/ekklesia_backup_*.sql.gz 2>/dev/null | tail -5 || echo "Nenhum backup encontrado"

