# ✅ Checklist de Verificação CI/CD

Use este checklist para garantir que o CI/CD está configurado corretamente.

## 🔐 Secrets do GitHub (Obrigatórios)

- [ ] `VPS_SSH_PRIVATE_KEY` - Chave privada SSH
- [ ] `VPS_HOST` - IP/domínio da VPS (ex: `72.61.42.147`)
- [ ] `VPS_USER` - Usuário SSH (ex: `root`)
- [ ] `VPS_DEPLOY_PATH` - Caminho da aplicação (ex: `/root/ekklesia`)
- [ ] `DATABASE_URL` - URL do banco (ex: `mysql://root:senha@localhost:3306/ekklesia`)
- [ ] `JWT_SECRET` - Chave JWT (32+ caracteres)
- [ ] `NEXTAUTH_SECRET` - Chave NextAuth (32+ caracteres)
- [ ] `ENCRYPTION_KEY` - Chave de criptografia (64 caracteres hex)
- [ ] `APP_URL` - URL pública da aplicação
- [ ] `NEXTAUTH_URL` - URL do NextAuth (geralmente igual a APP_URL)
- [ ] `ALLOWED_ORIGINS` - Origens CORS (opcional)

## 🔑 Configuração SSH na VPS

- [ ] Chave pública SSH está em `~/.ssh/authorized_keys` na VPS
- [ ] Permissões corretas: `chmod 600 ~/.ssh/authorized_keys`
- [ ] Conexão SSH testada manualmente (sem senha)
- [ ] Firewall permite porta 22 (SSH)

## 🖥️ Configuração da VPS

- [ ] Node.js 18+ instalado
- [ ] NPM instalado
- [ ] MySQL instalado e rodando
- [ ] PM2 instalado globalmente (`npm install -g pm2`)
- [ ] Diretório de deploy existe e tem permissões corretas
- [ ] Usuário SSH tem acesso ao diretório de deploy

## 📦 Aplicação na VPS

- [ ] Código está no diretório de deploy
- [ ] `package.json` existe
- [ ] Banco de dados existe e está acessível
- [ ] Migrações do Prisma podem ser executadas

## 🧪 Teste Manual

Execute estes comandos na VPS para testar:

```bash
# 1. Testar conexão SSH (do seu Mac)
ssh -i ~/.ssh/github-actions-deploy root@72.61.42.147

# 2. Na VPS, testar comandos do deploy
cd /root/ekklesia
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart ekklesia
```

## 🚀 Testar CI/CD

### Teste 1: CI (Automático)

1. Faça um commit e push para `main`/`master`
2. Acesse: `https://github.com/seu-usuario/ekklesia/actions`
3. Verifique se o workflow CI executou
4. Verifique se todos os jobs passaram:
   - ✅ Lint
   - ✅ Build
   - ✅ Testes LGPD
   - ✅ Type Check

### Teste 2: Deploy Manual

1. Acesse: `https://github.com/seu-usuario/ekklesia/actions`
2. Clique em "Deploy para VPS"
3. Clique em "Run workflow"
4. Selecione branch `main` ou `master`
5. Clique em "Run workflow"
6. Acompanhe a execução
7. Verifique se o deploy foi bem-sucedido

### Teste 3: Deploy Automático

1. Faça um commit e push para `main`/`master`
2. O deploy deve executar automaticamente
3. Verifique os logs em Actions
4. Verifique se a aplicação está rodando na VPS

## 🐛 Troubleshooting Comum

### CI falha no lint

```bash
# Executar localmente
npm run lint
```

### CI falha no build

```bash
# Executar localmente
npm run build
```

### Deploy falha na conexão SSH

- Verifique se `VPS_SSH_PRIVATE_KEY` está correto
- Verifique se a chave pública está na VPS
- Teste conexão manualmente

### Deploy falha no PM2

```bash
# Na VPS, verificar PM2
pm2 list
pm2 logs ekklesia
```

### Deploy falha nas migrações

```bash
# Na VPS, executar manualmente
cd /root/ekklesia
npx prisma migrate deploy
```

## ✅ Tudo Pronto?

Se todos os itens acima estão marcados, o CI/CD deve funcionar!

Faça um commit e push para testar:

```bash
git add .
git commit -m "test: verificar CI/CD"
git push origin main
```

---

**Última atualização:** $(date)

