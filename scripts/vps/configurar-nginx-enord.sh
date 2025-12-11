#!/bin/bash

# Script para configurar Nginx para enord.app
# Execute com: sudo ./scripts/vps/configurar-nginx-enord.sh

set -e

echo "🔧 Configurando Nginx para enord.app"
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
    print_error "Execute este script com sudo: sudo $0"
    exit 1
fi

DOMAIN="enord.app"
APP_PORT=3000
CONFIG_FILE="/etc/nginx/sites-available/${DOMAIN}"

print_info "Configurando Nginx para domínio: ${DOMAIN}"
print_info "Porta da aplicação: ${APP_PORT}"

# Verificar se Nginx está instalado
if ! command -v nginx &> /dev/null; then
    print_error "Nginx não está instalado"
    print_info "Instalando Nginx..."
    apt update
    apt install -y nginx
fi

# Criar configuração
print_info "Criando configuração do Nginx..."

cat > "${CONFIG_FILE}" << EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    # Logs
    access_log /var/log/nginx/${DOMAIN}.access.log;
    error_log /var/log/nginx/${DOMAIN}.error.log;

    # Tamanho máximo de upload
    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:${APP_PORT};
        proxy_http_version 1.1;
        
        # Headers importantes
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Cache
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

print_success "Configuração criada em ${CONFIG_FILE}"

# Ativar configuração
print_info "Ativando configuração..."

# Remover link simbólico antigo se existir
if [ -L "/etc/nginx/sites-enabled/${DOMAIN}" ]; then
    rm -f "/etc/nginx/sites-enabled/${DOMAIN}"
fi

# Criar novo link simbólico
ln -sf "${CONFIG_FILE}" "/etc/nginx/sites-enabled/${DOMAIN}"

# Remover default se estiver interferindo
if [ -L "/etc/nginx/sites-enabled/default" ]; then
    print_warning "Removendo configuração default do Nginx"
    rm -f "/etc/nginx/sites-enabled/default"
fi

# Testar configuração
print_info "Testando configuração do Nginx..."
if nginx -t; then
    print_success "Configuração do Nginx está válida"
else
    print_error "Erro na configuração do Nginx!"
    exit 1
fi

# Recarregar Nginx
print_info "Recarregando Nginx..."
if systemctl reload nginx; then
    print_success "Nginx recarregado com sucesso"
else
    print_error "Erro ao recarregar Nginx"
    print_info "Tentando reiniciar..."
    systemctl restart nginx
fi

# Verificar status
print_info "Verificando status do Nginx..."
if systemctl is-active --quiet nginx; then
    print_success "Nginx está rodando"
else
    print_error "Nginx não está rodando"
    exit 1
fi

# Verificar se aplicação está respondendo
print_info "Verificando se aplicação está respondendo em localhost:${APP_PORT}..."
sleep 2
if curl -f -s http://localhost:${APP_PORT} > /dev/null 2>&1; then
    print_success "Aplicação está respondendo em localhost:${APP_PORT}"
else
    print_warning "Aplicação não está respondendo em localhost:${APP_PORT}"
    print_info "Verifique se PM2 está rodando: pm2 status"
fi

echo ""
print_success "✅ Configuração do Nginx concluída!"
echo ""
print_info "Próximos passos:"
echo "  1. Verifique se o DNS está apontando para este servidor"
echo "  2. Teste acessando: http://${DOMAIN}"
echo "  3. Para SSL, execute: sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo ""
print_info "Comandos úteis:"
echo "  - Ver logs: sudo tail -f /var/log/nginx/${DOMAIN}.error.log"
echo "  - Testar configuração: sudo nginx -t"
echo "  - Recarregar: sudo systemctl reload nginx"
echo ""
