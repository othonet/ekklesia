#!/bin/bash

# Script de Configuração do Nginx
# Este script cria a configuração do Nginx para a aplicação

set -e

echo "🌐 Configurando Nginx..."
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

# Solicitar porta da aplicação
read -p "Porta da aplicação Next.js [3000]: " APP_PORT
APP_PORT=${APP_PORT:-3000}

print_info "Criando configuração do Nginx para ${DOMAIN}..."

# Criar arquivo de configuração do Nginx
NGINX_CONFIG="/etc/nginx/sites-available/ekklesia"

cat > "$NGINX_CONFIG" <<EOF
# Redirecionar HTTP para HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    # Permitir certificado SSL do Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Redirecionar todo o resto para HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# Configuração HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN};

    # Certificados SSL (serão configurados pelo Certbot)
    # ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    
    # Configurações SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Headers de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Tamanho máximo de upload (para imagens, etc)
    client_max_body_size 10M;

    # Proxy para Next.js
    location / {
        proxy_pass http://localhost:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Ativar configuração
if [ -L "/etc/nginx/sites-enabled/ekklesia" ]; then
    rm /etc/nginx/sites-enabled/ekklesia
fi

ln -s "$NGINX_CONFIG" /etc/nginx/sites-enabled/

# Testar configuração
print_info "Testando configuração do Nginx..."
if nginx -t; then
    print_success "Configuração do Nginx válida"
else
    print_error "Erro na configuração do Nginx"
    exit 1
fi

# Recarregar Nginx
systemctl reload nginx
print_success "Nginx recarregado"

echo ""
print_success "Configuração do Nginx concluída!"
print_info "Próximo passo: Execute ./scripts/vps/configurar-ssl.sh ${DOMAIN} para configurar SSL"

