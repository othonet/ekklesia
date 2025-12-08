#!/bin/bash

# Script para Testar Configuração do CI/CD

echo "🧪 Testando Configuração do CI/CD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS=0
FAIL=0

test_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASS++))
}

test_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((FAIL++))
}

test_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "Execute este script na raiz do projeto"
    exit 1
fi

echo "1. Verificando arquivos de workflow..."
if [ -f ".github/workflows/ci.yml" ]; then
    test_pass "Workflow CI encontrado"
else
    test_fail "Workflow CI não encontrado"
fi

if [ -f ".github/workflows/deploy.yml" ]; then
    test_pass "Workflow Deploy encontrado"
else
    test_fail "Workflow Deploy não encontrado"
fi

if [ -f ".github/workflows/cleanup-data.yml" ]; then
    test_pass "Workflow Cleanup encontrado"
else
    test_fail "Workflow Cleanup não encontrado"
fi

echo ""
echo "2. Verificando sintaxe YAML..."
if command -v yamllint > /dev/null 2>&1; then
    if yamllint .github/workflows/*.yml > /dev/null 2>&1; then
        test_pass "Sintaxe YAML válida"
    else
        test_fail "Erro na sintaxe YAML"
        yamllint .github/workflows/*.yml
    fi
else
    test_info "yamllint não instalado (pule esta verificação)"
fi

echo ""
echo "3. Verificando scripts de deploy..."
if [ -f "scripts/vps/deploy.sh" ]; then
    test_pass "Script deploy.sh encontrado"
else
    test_fail "Script deploy.sh não encontrado"
fi

if [ -f "scripts/vps/provisionar-vps.sh" ]; then
    test_pass "Script provisionar-vps.sh encontrado"
else
    test_fail "Script provisionar-vps.sh não encontrado"
fi

echo ""
echo "4. Verificando package.json..."
if grep -q '"build"' package.json; then
    test_pass "Script build encontrado no package.json"
else
    test_fail "Script build não encontrado no package.json"
fi

if grep -q '"lint"' package.json; then
    test_pass "Script lint encontrado no package.json"
else
    test_fail "Script lint não encontrado no package.json"
fi

echo ""
echo "5. Verificando arquivos de configuração..."
if [ -f ".gitignore" ]; then
    if grep -q "\.env" .gitignore; then
        test_pass ".env está no .gitignore"
    else
        test_fail ".env não está no .gitignore"
    fi
else
    test_fail ".gitignore não encontrado"
fi

if [ -f "next.config.js" ] || [ -f "next.config.ts" ]; then
    test_pass "next.config encontrado"
else
    test_fail "next.config não encontrado"
fi

if [ -f "prisma/schema.prisma" ]; then
    test_pass "Schema Prisma encontrado"
else
    test_fail "Schema Prisma não encontrado"
fi

echo ""
echo "6. Verificando documentação..."
if [ -f ".github/CICD.md" ]; then
    test_pass "Documentação CICD.md encontrada"
else
    test_fail "Documentação CICD.md não encontrada"
fi

if [ -f ".github/SECRETS.example.md" ]; then
    test_pass "Documentação SECRETS.example.md encontrada"
else
    test_fail "Documentação SECRETS.example.md não encontrada"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Resumo:"
echo -e "   ${GREEN}✅ Testes passaram: $PASS${NC}"
if [ $FAIL -gt 0 ]; then
    echo -e "   ${RED}❌ Testes falharam: $FAIL${NC}"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 Todos os testes passaram!${NC}"
    echo ""
    echo "Próximos passos:"
    echo "1. Configure os secrets no GitHub"
    echo "2. Configure chave SSH na VPS"
    echo "3. Faça push para main/master para testar"
    exit 0
else
    echo -e "${RED}⚠️  Alguns testes falharam. Corrija os problemas acima.${NC}"
    exit 1
fi

