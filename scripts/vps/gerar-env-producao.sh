#!/bin/bash

# Script para Gerar Arquivo .env de Produção
# Este script gera todas as chaves necessárias e cria o arquivo .env.production

set -e

echo "🔐 Gerando variáveis de ambiente de produção..."
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

# Solicitar informações
read -p "Domínio da aplicação (ex: https://api.ekklesia.com.br): " APP_URL

if [ -z "$APP_URL" ]; then
    print_error "Domínio é obrigatório"
    exit 1
fi

# Remover https:// se fornecido
APP_URL=$(echo "$APP_URL" | sed 's|^https\?://||')

# Carregar DATABASE_URL se existir
if [ -f "/tmp/ekklesia-deploy/database.env" ]; then
    source /tmp/ekklesia-deploy/database.env
    print_info "DATABASE_URL carregada do arquivo anterior"
else
    read -p "DATABASE_URL (mysql://user:pass@host:port/db): " DATABASE_URL
fi

# Gerar chaves seguras
print_info "Gerando chaves seguras..."

JWT_SECRET=$(openssl rand -hex 32)
NEXTAUTH_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)

print_success "Chaves geradas"

# Criar arquivo .env.production
ENV_FILE=".env.production"

cat > "$ENV_FILE" <<EOF
# Ambiente
NODE_ENV=production

# Database
DATABASE_URL="${DATABASE_URL}"

# JWT
JWT_SECRET="${JWT_SECRET}"
JWT_EXPIRES_IN=7d

# Next.js
NEXTAUTH_URL="https://${APP_URL}"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"

# Application URL
APP_URL="https://${APP_URL}"

# LGPD Compliance
ENCRYPTION_KEY="${ENCRYPTION_KEY}"

# CORS - Origens permitidas (separadas por vírgula)
# Adicione outros domínios se necessário
ALLOWED_ORIGINS=https://${APP_URL}

# Email (opcional - configure se necessário)
# SENDGRID_API_KEY=""
# EMAIL_FROM="noreply@${APP_URL}"
# RESEND_API_KEY=""
EOF

print_success "Arquivo .env.production criado!"

echo ""
print_info "⚠️  IMPORTANTE: Guarde estas chaves em local seguro!"
echo ""
echo "JWT_SECRET: ${JWT_SECRET}"
echo "NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}"
echo "ENCRYPTION_KEY: ${ENCRYPTION_KEY}"
echo ""

# Perguntar se quer salvar em arquivo seguro
read -p "Deseja salvar as chaves em um arquivo seguro? (s/N): " SAVE_KEYS

if [[ "$SAVE_KEYS" =~ ^[Ss]$ ]]; then
    KEYS_FILE=".env.keys.backup"
    cat > "$KEYS_FILE" <<EOF
# Backup das chaves geradas em $(date)
# GUARDE ESTE ARQUIVO EM LOCAL SEGURO!

JWT_SECRET="${JWT_SECRET}"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
ENCRYPTION_KEY="${ENCRYPTION_KEY}"
EOF
    chmod 600 "$KEYS_FILE"
    print_success "Chaves salvas em ${KEYS_FILE} (permissões restritas)"
fi

echo ""
print_success "Configuração concluída!"
print_info "Arquivo criado: ${ENV_FILE}"

