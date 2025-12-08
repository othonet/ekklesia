# 📁 GitHub Actions - CI/CD

Este diretório contém os workflows de CI/CD para o projeto Ekklesia.

## 📋 Workflows Disponíveis

### 1. CI (`ci.yml`)

**Quando executa:**
- Push para `main`, `master` ou `develop`
- Pull Requests para `main`, `master` ou `develop`

**O que faz:**
- ✅ Lint do código (ESLint)
- ✅ Build da aplicação Next.js
- ✅ Testes LGPD
- ✅ Verificação de tipos TypeScript

**Status:** Mostra badge no README quando configurado

### 2. Deploy (`deploy.yml`)

**Quando executa:**
- Push para `main` ou `master` (automático)
- Manualmente via `workflow_dispatch`

**O que faz:**
- ✅ Backup do banco de dados
- ✅ Sincronização do código para VPS
- ✅ Instalação de dependências
- ✅ Migrações do banco de dados
- ✅ Build da aplicação
- ✅ Reinicialização com PM2
- ✅ Verificação do deploy

**Requisitos:**
- Secrets configurados no GitHub
- Chave SSH configurada na VPS
- PM2 instalado na VPS

### 3. Limpeza Automática (`cleanup-data.yml`)

**Quando executa:**
- Diariamente às 2h UTC (via cron)
- Manualmente via `workflow_dispatch`

**O que faz:**
- ✅ Limpeza de dados expirados (LGPD)
- ✅ Executa script `lgpd:cleanup`

**Requisitos:**
- `DATABASE_URL` configurado
- `ENCRYPTION_KEY` configurado

## 📚 Documentação

- **[CICD.md](CICD.md)** - Guia completo de configuração
- **[SECRETS.example.md](SECRETS.example.md)** - Lista de secrets necessários

## 🚀 Início Rápido

1. Configure os secrets no GitHub (veja [SECRETS.example.md](SECRETS.example.md))
2. Configure chave SSH na VPS
3. Faça push para `main`/`master` e o deploy será automático!

## 🔍 Ver Status

Acesse: `https://github.com/seu-usuario/ekklesia/actions`

## 📝 Notas

- Os workflows usam Node.js 18
- Cache de dependências npm está habilitado
- Deploy automático apenas em `main`/`master`
- CI executa em todas as branches principais

