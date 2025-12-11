#!/bin/bash

# Script de Diagnóstico da VPS
# Verifica todos os componentes necessários para a aplicação funcionar

set -e

echo "🔍 DIAGNÓSTICO DA VPS - Ekklesia"
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

# 1. Verificar PM2
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_info "1. Verificando PM2..."
echo ""

if command -v pm2 &> /dev/null; then
    PM2_STATUS=$(pm2 list | grep ekklesia || echo "")
    if [ ! -z "$PM2_STATUS" ]; then
        if echo "$PM2_STATUS" | grep -q "online"; then
            print_success "PM2: Aplicação está rodando"
            pm2 status
        else
            print_error "PM2: Aplicação não está online"
            pm2 status
            echo ""
            print_info "Últimos logs:"
            pm2 logs ekklesia --lines 20 --nostream
        fi
    else
        print_error "PM2: Aplicação 'ekklesia' não encontrada"
        print_info "Execute: pm2 start npm --name 'ekklesia' -- start"
    fi
else
    print_error "PM2 não está instalado"
fi

# 2. Verificar aplicação local
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_info "2. Verificando resposta da aplicação (localhost:3000)..."
echo ""

if curl -f -s http://localhost:3000 > /dev/null 2>&1; then
    print_success "Aplicação está respondendo em http://localhost:3000"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
    print_info "Código HTTP: $HTTP_CODE"
else
    print_error "Aplicação NÃO está respondendo em http://localhost:3000"
    print_info "Verifique os logs do PM2: pm2 logs ekklesia"
fi

# 3. Verificar Nginx
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_info "3. Verificando Nginx..."
echo ""

if systemctl is-active --quiet nginx; then
    print_success "Nginx está rodando"
    
    if sudo nginx -t 2>&1 | grep -q "successful"; then
        print_success "Configuração do Nginx está válida"
    else
        print_error "Configuração do Nginx tem erros:"
        sudo nginx -t
    fi
else
    print_error "Nginx NÃO está rodando"
    print_info "Execute: sudo systemctl start nginx"
fi

# 4. Verificar porta 3000
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_info "4. Verificando porta 3000..."
echo ""

if netstat -tlnp 2>/dev/null | grep -q ":3000" || ss -tlnp 2>/dev/null | grep -q ":3000"; then
    print_success "Porta 3000 está em uso"
    if command -v netstat &> /dev/null; then
        netstat -tlnp | grep ":3000"
    else
        ss -tlnp | grep ":3000"
    fi
else
    print_error "Porta 3000 NÃO está em uso"
    print_info "A aplicação pode não ter iniciado corretamente"
fi

# 5. Verificar diretório e build
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_info "5. Verificando diretório da aplicação e build..."
echo ""

# Tentar encontrar o diretório
POSSIBLE_PATHS=(
    "/root/ekklesia"
    "$HOME/ekklesia"
    "/var/www/ekklesia"
    "$(pwd)"
)

APP_DIR=""
for path in "${POSSIBLE_PATHS[@]}"; do
    if [ -f "$path/package.json" ]; then
        APP_DIR="$path"
        break
    fi
done

if [ -z "$APP_DIR" ]; then
    print_error "Diretório da aplicação não encontrado"
    print_info "Procure manualmente onde está o package.json"
else
    print_success "Diretório encontrado: $APP_DIR"
    cd "$APP_DIR"
    
    if [ -d ".next" ] && [ "$(ls -A .next 2>/dev/null)" ]; then
        print_success "Build existe (.next/)"
    else
        print_error "Build NÃO existe ou está vazio"
        print_info "Execute: npm run build"
    fi
    
    if [ -f ".env.production" ]; then
        print_success "Arquivo .env.production existe"
    else
        print_warning "Arquivo .env.production não encontrado"
    fi
    
    if [ -f ".env" ]; then
        print_success "Arquivo .env existe"
    else
        print_warning "Arquivo .env não encontrado"
        if [ -f ".env.production" ]; then
            print_info "Copie .env.production para .env"
        fi
    fi
fi

# 6. Verificar banco de dados
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_info "6. Verificando conexão com banco de dados..."
echo ""

if [ ! -z "$APP_DIR" ] && [ -f "$APP_DIR/.env" ]; then
    cd "$APP_DIR"
    if npx prisma db pull --schema=./prisma/schema.prisma > /dev/null 2>&1; then
        print_success "Conexão com banco de dados OK"
    else
        print_error "Erro ao conectar com banco de dados"
        print_info "Verifique a DATABASE_URL no .env"
    fi
else
    print_warning "Não foi possível verificar banco (diretório não encontrado)"
fi

# 7. Verificar logs do Nginx
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_info "7. Últimos erros do Nginx (se houver)..."
echo ""

if [ -f "/var/log/nginx/error.log" ]; then
    ERROR_COUNT=$(sudo tail -20 /var/log/nginx/error.log | grep -i error | wc -l)
    if [ "$ERROR_COUNT" -gt 0 ]; then
        print_warning "Encontrados erros recentes no Nginx:"
        sudo tail -10 /var/log/nginx/error.log | grep -i error
    else
        print_success "Nenhum erro recente no Nginx"
    fi
fi

# Resumo
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
print_info "📋 RESUMO DO DIAGNÓSTICO"
echo ""
print_info "Para ver logs completos da aplicação:"
echo "  pm2 logs ekklesia --lines 100"
echo ""
print_info "Para reiniciar a aplicação:"
echo "  pm2 restart ekklesia"
echo ""
print_info "Para ver logs do Nginx:"
echo "  sudo tail -f /var/log/nginx/error.log"
echo ""
