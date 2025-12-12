# ✅ Checklist de Deploy na VPS

Este documento lista **tudo que precisa ser feito na VPS** para que o app funcione corretamente após o deploy automático.

## 🚀 Deploy Automático (CI/CD)

O GitHub Actions já executa automaticamente:
- ✅ Sincronização do código via rsync
- ✅ Instalação de dependências (`npm ci`)
- ✅ Geração do cliente Prisma (`npx prisma generate`)
- ✅ Execução de migrações (`npx prisma migrate deploy`)
- ✅ Build da aplicação (`npm run build`)
- ✅ Reinicialização do PM2

## ⚠️ O Que Pode Estar Faltando

### 1. **Módulos do Sistema no Banco de Dados**

Os módulos precisam estar criados no banco. Execute na VPS:

```bash
# Conectar na VPS
ssh usuario@seu-servidor.com

# Ir para o diretório da aplicação
cd /caminho/da/aplicacao

# Executar seed para criar módulos e planos
npm run db:seed
```

**Importante:** O seed cria:
- Todos os módulos do sistema (MEMBERS, FINANCES, MINISTRIES, etc.)
- Planos padrão (Básico, Intermediário, Master)
- Associa módulos aos planos

### 2. **Verificar se os Módulos Foram Criados**

```bash
# Conectar ao MySQL
mysql -u usuario -p nome_do_banco

# Verificar módulos
SELECT key, name, route, active FROM modules;

# Verificar planos
SELECT key, name, active FROM plans;

# Verificar associação de módulos aos planos
SELECT p.key as plan_key, p.name as plan_name, m.key as module_key, m.name as module_name
FROM plans p
JOIN plan_modules pm ON p.id = pm.planId
JOIN modules m ON pm.moduleId = m.id;
```

### 3. **Verificar Variáveis de Ambiente**

Certifique-se de que o arquivo `.env` na VPS tem todas as variáveis necessárias:

```bash
# Verificar arquivo .env
cat .env | grep -E "DATABASE_URL|JWT_SECRET|ENCRYPTION_KEY|NEXTAUTH"

# Variáveis obrigatórias:
# - DATABASE_URL
# - JWT_SECRET
# - ENCRYPTION_KEY
# - NEXTAUTH_SECRET
# - NEXTAUTH_URL
# - APP_URL
```

### 4. **Verificar Status da Aplicação**

```bash
# Status do PM2
pm2 status

# Logs da aplicação
pm2 logs ekklesia --lines 100

# Verificar se está respondendo
curl http://localhost:3000
```

### 5. **Verificar Nginx (se configurado)**

```bash
# Testar configuração
sudo nginx -t

# Status do Nginx
sudo systemctl status nginx

# Recarregar se necessário
sudo systemctl reload nginx
```

## 📋 Checklist Completo

Execute na VPS na seguinte ordem:

### ✅ Passo 1: Verificar Código Atualizado
```bash
cd /caminho/da/aplicacao
git pull origin master  # Se usar git na VPS
# OU verificar se o rsync do CI/CD sincronizou
```

### ✅ Passo 2: Verificar Variáveis de Ambiente
```bash
# Verificar se .env existe e tem todas as variáveis
cat .env

# Se não existir ou estiver incompleto, criar/atualizar
nano .env
```

### ✅ Passo 3: Instalar Dependências (se necessário)
```bash
npm ci --production=false
```

### ✅ Passo 4: Gerar Cliente Prisma
```bash
npm run db:generate
# OU
npx prisma generate
```

### ✅ Passo 5: Executar Migrações
```bash
npx prisma migrate deploy
```

### ✅ Passo 6: Criar Módulos e Planos (IMPORTANTE!)
```bash
# Executar seed para criar módulos e planos
npm run db:seed
```

**Nota:** O seed é idempotente (pode ser executado múltiplas vezes sem problemas).

### ✅ Passo 7: Build da Aplicação
```bash
npm run build
```

### ✅ Passo 8: Reiniciar Aplicação
```bash
pm2 restart ekklesia
# OU se não estiver rodando:
pm2 start npm --name "ekklesia" -- start
pm2 save
```

## 🔍 Verificação Pós-Deploy

### 1. Verificar se os Módulos Estão no Banco

```bash
# Via Prisma Studio (recomendado)
npx prisma studio

# OU via MySQL
mysql -u usuario -p nome_do_banco -e "SELECT key, name, route FROM modules;"
```

### 2. Testar Acesso à Plataforma

1. Acesse `/platform/login` no navegador
2. Faça login como administrador da plataforma
3. Verifique se consegue acessar `/platform/modules`
4. Verifique se os módulos aparecem listados

### 3. Testar Associação de Módulos

1. Acesse `/platform/tenants`
2. Selecione uma igreja
3. Vá em "Módulos"
4. Tente associar um módulo
5. Verifique se o menu aparece no dashboard da igreja

### 4. Verificar Logs

```bash
# Logs do PM2
pm2 logs ekklesia --lines 50

# Verificar erros
pm2 logs ekklesia --err --lines 50
```

## 🐛 Problemas Comuns

### Problema: Módulos não aparecem no menu

**Solução:**
1. Verificar se os módulos estão no banco: `SELECT * FROM modules;`
2. Verificar se a igreja tem módulos associados: `SELECT * FROM church_modules WHERE churchId = '...';`
3. Verificar se o módulo tem `route` definida: `SELECT key, route FROM modules WHERE route IS NULL;`
4. Verificar logs do navegador (F12) para erros de API

### Problema: Erro ao acessar rotas do dashboard

**Solução:**
1. Verificar se o módulo está ativo: `SELECT key, active FROM modules;`
2. Verificar se a igreja tem o módulo no plano ou individual
3. Verificar permissões do usuário no middleware

### Problema: Build falha

**Solução:**
1. Verificar se todas as dependências estão instaladas: `npm ci`
2. Verificar se o Prisma Client foi gerado: `npm run db:generate`
3. Verificar logs do build: `npm run build 2>&1 | tee build.log`

## 📝 Script Rápido de Verificação

Crie um arquivo `verificar-deploy.sh` na VPS:

```bash
#!/bin/bash
echo "🔍 Verificando deploy..."

echo "1. Verificando módulos no banco..."
npx prisma studio --browser none &
sleep 2
pkill -f "prisma studio"

echo "2. Verificando status do PM2..."
pm2 status

echo "3. Verificando logs recentes..."
pm2 logs ekklesia --lines 20 --nostream

echo "4. Testando endpoint..."
curl -I http://localhost:3000

echo "✅ Verificação concluída!"
```

## 🎯 Resumo: O Que Fazer AGORA na VPS

Se você acabou de fazer deploy, execute estes comandos na VPS:

```bash
# 1. Ir para o diretório
cd /caminho/da/aplicacao

# 2. Verificar se .env está correto
cat .env | head -10

# 3. Executar seed (CRÍTICO para módulos funcionarem!)
npm run db:seed

# 4. Verificar se funcionou
npx prisma studio  # Abre interface web para ver o banco

# 5. Reiniciar aplicação
pm2 restart ekklesia

# 6. Verificar logs
pm2 logs ekklesia --lines 30
```

**O passo mais importante é executar `npm run db:seed`** para criar os módulos no banco de dados!

---

**Última atualização:** Após implementação do sistema de módulos
