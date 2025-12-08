#!/bin/bash

# Script de Configuração do SSL (Let's Encrypt)
# Este script configura o certificado SSL usando Certbot

set -e

echo "🔒 Configurando SSL com Let's Encrypt..."
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

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    print_error "Por favor, execute como root (use sudo)"
    exit 1
fi

# Solicitar domínio
if [ -z "$1" ]; then
    read -p "Digite o domínio da aplicação (ex: api.ekklesia.com.br): " DOMAIN
else
    DOMAIN=$1
fi

if [ -z "$DOMAIN" ]; then
    print_error "Domínio é obrigatório"
    exit 1
fi

# Solicitar email
read -p "Email para notificações do Let's Encrypt: " EMAIL

if [ -z "$EMAIL" ]; then
    print_error "Email é obrigatório"
    exit 1
fi

print_info "Obtendo certificado SSL para ${DOMAIN}..."
print_info "Certifique-se de que o domínio ${DOMAIN} está apontando para este servidor!"

read -p "O domínio está apontando para este servidor? (s/N): " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Ss]$ ]]; then
    print_error "Configure o DNS primeiro e tente novamente"
    exit 1
fi

# Obter certificado SSL
print_info "Executando Certbot..."
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "$EMAIL" --redirect

if [ $? -eq 0 ]; then
    print_success "Certificado SSL configurado com sucesso!"
    
    # Testar renovação automática
    print_info "Testando renovação automática..."
    certbot renew --dry-run
    
    if [ $? -eq 0 ]; then
        print_success "Renovação automática configurada"
    else
        print_info "Renovação automática pode precisar de configuração manual"
    fi
else
    print_error "Erro ao obter certificado SSL"
    exit 1
fi

# Recarregar Nginx
systemctl reload nginx
print_success "Nginx recarregado com nova configuração SSL"

echo ""
print_success "SSL configurado com sucesso!"
print_info "Acesse: https://${DOMAIN}"

