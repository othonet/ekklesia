#!/bin/bash

# Script de Deploy Completo - Executa todos os passos necessários
# Use este script para fazer o deploy completo da aplicação

set -e

echo "🚀 Deploy Completo da Aplicação Ekklesia"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

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

print_step() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    print_error "Execute este script na raiz do projeto"
    exit 1
fi

# Verificar se está rodando como root (para alguns passos)
if [ "$EUID" -ne 0 ]; then 
    print_warning "Alguns passos requerem privilégios de root"
    print_info "Você precisará executar alguns comandos com sudo"
fi

# Menu interativo
echo "Escolha uma opção:"
echo "1) Provisionamento completo (primeira vez)"
echo "2) Apenas deploy da aplicação (já configurado)"
echo "3) Atualizar aplicação existente"
echo ""
read -p "Opção [1]: " OPTION
OPTION=${OPTION:-1}

case $OPTION in
    1)
        print_step "PASSO 1: Provisionamento Inicial da VPS"
        if [ "$EUID" -eq 0 ]; then
            ./scripts/vps/provisionar-vps.sh
        else
            print_info "Execute: sudo ./scripts/vps/provisionar-vps.sh"
            read -p "Pressione Enter após executar o comando acima..."
        fi
        
        print_step "PASSO 2: Configuração do Banco de Dados"
        if [ "$EUID" -eq 0 ]; then
            ./scripts/vps/configurar-banco.sh
        else
            print_info "Execute: sudo ./scripts/vps/configurar-banco.sh"
            read -p "Pressione Enter após executar o comando acima..."
        fi
        
        print_step "PASSO 3: Configuração do Nginx"
        read -p "Digite o domínio da aplicação (ex: api.ekklesia.com.br): " DOMAIN
        if [ ! -z "$DOMAIN" ]; then
            if [ "$EUID" -eq 0 ]; then
                ./scripts/vps/configurar-nginx.sh "$DOMAIN"
            else
                print_info "Execute: sudo ./scripts/vps/configurar-nginx.sh $DOMAIN"
                read -p "Pressione Enter após executar o comando acima..."
            fi
        fi
        
        print_step "PASSO 4: Configuração SSL (Opcional)"
        read -p "Deseja configurar SSL agora? (s/N): " CONFIGURE_SSL
        if [[ "$CONFIGURE_SSL" =~ ^[Ss]$ ]] && [ ! -z "$DOMAIN" ]; then
            if [ "$EUID" -eq 0 ]; then
                ./scripts/vps/configurar-ssl.sh "$DOMAIN"
            else
                print_info "Execute: sudo ./scripts/vps/configurar-ssl.sh $DOMAIN"
                print_warning "Certifique-se de que o domínio está apontando para este servidor!"
                read -p "Pressione Enter após executar o comando acima..."
            fi
        fi
        
        print_step "PASSO 5: Gerar Variáveis de Ambiente"
        ./scripts/vps/gerar-env-producao.sh
        
        print_step "PASSO 6: Deploy da Aplicação"
        ./scripts/vps/deploy.sh
        ;;
        
    2)
        print_step "Deploy da Aplicação"
        
        # Verificar se .env.production existe
        if [ ! -f ".env.production" ]; then
            print_warning ".env.production não encontrado"
            print_info "Gerando variáveis de ambiente..."
            ./scripts/vps/gerar-env-producao.sh
        fi
        
        ./scripts/vps/deploy.sh
        ;;
        
    3)
        print_step "Atualizando Aplicação"
        
        print_info "Fazendo pull das mudanças..."
        git pull
        
        print_info "Instalando/atualizando dependências..."
        npm ci --production=false
        
        print_info "Gerando cliente Prisma..."
        npx prisma generate
        
        print_info "Executando migrações..."
        npx prisma migrate deploy
        
        print_info "Fazendo build..."
        npm run build
        
        print_info "Reiniciando aplicação..."
        pm2 restart ekklesia
        
        print_success "Aplicação atualizada!"
        ;;
        
    *)
        print_error "Opção inválida"
        exit 1
        ;;
esac

echo ""
print_step "Deploy Concluído!"
echo ""
print_info "Comandos úteis:"
echo "  - Ver logs: pm2 logs ekklesia"
echo "  - Status: pm2 status"
echo "  - Monitorar: pm2 monit"
echo "  - Reiniciar: pm2 restart ekklesia"
echo ""

