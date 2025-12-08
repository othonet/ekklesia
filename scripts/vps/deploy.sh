#!/bin/bash

# Script de Deploy Automatizado
# Este script faz o build e inicia a aplicação com PM2

set -e

echo "🚀 Iniciando deploy da aplicação..."
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

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    print_error "Execute este script na raiz do projeto"
    exit 1
fi

# Verificar se .env.production existe
if [ ! -f ".env.production" ]; then
    print_error "Arquivo .env.production não encontrado!"
    print_info "Execute primeiro: ./scripts/vps/gerar-env-producao.sh"
    exit 1
fi

# Copiar .env.production para .env
print_info "Configurando variáveis de ambiente..."
cp .env.production .env
print_success "Variáveis de ambiente configuradas"

# Instalar dependências
print_info "Instalando dependências..."
npm ci --production=false
print_success "Dependências instaladas"

# Gerar cliente Prisma
print_info "Gerando cliente Prisma..."
npx prisma generate
print_success "Cliente Prisma gerado"

# Executar migrações
print_info "Executando migrações do banco de dados..."
npx prisma migrate deploy
print_success "Migrações executadas"

# Popular banco (opcional)
read -p "Deseja executar o seed do banco de dados? (s/N): " RUN_SEED
if [[ "$RUN_SEED" =~ ^[Ss]$ ]]; then
    print_info "Executando seed..."
    npm run db:seed || print_info "Seed pode ter falhado (normal se já foi executado)"
fi

# Build da aplicação
print_info "Fazendo build da aplicação..."
npm run build
print_success "Build concluído"

# Parar aplicação se já estiver rodando
if pm2 list | grep -q "ekklesia"; then
    print_info "Parando aplicação existente..."
    pm2 stop ekklesia || true
    pm2 delete ekklesia || true
fi

# Iniciar com PM2
print_info "Iniciando aplicação com PM2..."
pm2 start npm --name "ekklesia" -- start
print_success "Aplicação iniciada"

# Salvar configuração do PM2
pm2 save
print_success "Configuração do PM2 salva"

# Configurar startup automático (se ainda não configurado)
if ! pm2 startup | grep -q "already"; then
    print_info "Configurando startup automático..."
    STARTUP_CMD=$(pm2 startup | grep "sudo")
    if [ ! -z "$STARTUP_CMD" ]; then
        print_info "Execute este comando para configurar startup automático:"
        echo "$STARTUP_CMD"
    fi
fi

# Mostrar status
echo ""
print_success "Deploy concluído!"
echo ""
print_info "Status da aplicação:"
pm2 status
echo ""
print_info "Para ver os logs:"
echo "  pm2 logs ekklesia"
echo ""
print_info "Para monitorar:"
echo "  pm2 monit"
echo ""

# Testar aplicação
print_info "Testando aplicação..."
sleep 3
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_success "Aplicação respondendo em http://localhost:3000"
else
    print_error "Aplicação não está respondendo. Verifique os logs: pm2 logs ekklesia"
fi

