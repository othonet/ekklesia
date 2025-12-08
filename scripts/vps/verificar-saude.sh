#!/bin/bash

# Script de Verificação de Saúde da Aplicação
# Este script verifica se todos os componentes estão funcionando corretamente

echo "🏥 Verificando saúde da aplicação..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

OK=0
ERRO=0

check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
        ((OK++))
        return 0
    else
        echo -e "${RED}❌ $1${NC}"
        ((ERRO++))
        return 1
    fi
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# 1. Verificar Node.js
print_info "Verificando Node.js..."
node --version > /dev/null 2>&1
check "Node.js instalado: $(node --version 2>/dev/null || echo 'não encontrado')"

# 2. Verificar NPM
print_info "Verificando NPM..."
npm --version > /dev/null 2>&1
check "NPM instalado: $(npm --version 2>/dev/null || echo 'não encontrado')"

# 3. Verificar MySQL
print_info "Verificando MySQL..."
systemctl is-active --quiet mysql
check "MySQL está rodando"

# 4. Verificar Nginx
print_info "Verificando Nginx..."
systemctl is-active --quiet nginx
check "Nginx está rodando"

# 5. Verificar PM2
print_info "Verificando PM2..."
command -v pm2 > /dev/null 2>&1
check "PM2 instalado"

# 6. Verificar aplicação no PM2
print_info "Verificando aplicação no PM2..."
if pm2 list | grep -q "ekklesia.*online"; then
    echo -e "${GREEN}✅ Aplicação rodando no PM2${NC}"
    ((OK++))
else
    echo -e "${RED}❌ Aplicação não está rodando no PM2${NC}"
    ((ERRO++))
fi

# 7. Verificar porta 3000
print_info "Verificando porta 3000..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Aplicação respondendo na porta 3000${NC}"
    ((OK++))
else
    echo -e "${RED}❌ Aplicação não responde na porta 3000${NC}"
    ((ERRO++))
fi

# 8. Verificar arquivo .env
print_info "Verificando variáveis de ambiente..."
if [ -f ".env.production" ] || [ -f ".env" ]; then
    echo -e "${GREEN}✅ Arquivo .env encontrado${NC}"
    ((OK++))
else
    echo -e "${RED}❌ Arquivo .env não encontrado${NC}"
    ((ERRO++))
fi

# 9. Verificar conexão com banco de dados
print_info "Verificando conexão com banco de dados..."
if [ -f ".env.production" ]; then
    source .env.production
elif [ -f ".env" ]; then
    source .env
fi

if [ ! -z "$DATABASE_URL" ]; then
    # Tentar conectar (requer mysql client)
    if command -v mysql > /dev/null 2>&1; then
        # Extrair informações da URL
        if [[ $DATABASE_URL =~ mysql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
            DB_USER="${BASH_REMATCH[1]}"
            DB_PASSWORD="${BASH_REMATCH[2]}"
            DB_HOST="${BASH_REMATCH[3]}"
            DB_NAME="${BASH_REMATCH[5]}"
            
            mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME;" > /dev/null 2>&1
            check "Conexão com banco de dados OK"
        else
            echo -e "${YELLOW}⚠️  Não foi possível verificar conexão com banco${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Cliente MySQL não encontrado para verificar conexão${NC}"
    fi
else
    echo -e "${RED}❌ DATABASE_URL não configurada${NC}"
    ((ERRO++))
fi

# 10. Verificar configuração do Nginx
print_info "Verificando configuração do Nginx..."
if sudo nginx -t > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Configuração do Nginx válida${NC}"
    ((OK++))
else
    echo -e "${RED}❌ Erro na configuração do Nginx${NC}"
    ((ERRO++))
fi

# 11. Verificar certificado SSL (se configurado)
print_info "Verificando certificado SSL..."
if [ -d "/etc/letsencrypt/live" ]; then
    CERT_COUNT=$(ls -1 /etc/letsencrypt/live 2>/dev/null | wc -l)
    if [ "$CERT_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ Certificado SSL encontrado ($CERT_COUNT certificado(s))${NC}"
        ((OK++))
    else
        echo -e "${YELLOW}⚠️  Diretório SSL existe mas sem certificados${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  SSL não configurado${NC}"
fi

# 12. Verificar firewall
print_info "Verificando firewall..."
if command -v ufw > /dev/null 2>&1; then
    if ufw status | grep -q "Status: active"; then
        echo -e "${GREEN}✅ Firewall ativo${NC}"
        ((OK++))
    else
        echo -e "${YELLOW}⚠️  Firewall não está ativo${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  UFW não instalado${NC}"
fi

# Resumo
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Resumo:"
echo -e "   ${GREEN}✅ Verificações OK: $OK${NC}"
if [ $ERRO -gt 0 ]; then
    echo -e "   ${RED}❌ Erros encontrados: $ERRO${NC}"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRO -eq 0 ]; then
    echo -e "${GREEN}🎉 Tudo funcionando corretamente!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Alguns problemas foram encontrados. Revise os erros acima.${NC}"
    exit 1
fi

