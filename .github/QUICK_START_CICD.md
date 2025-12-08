# 🚀 Quick Start - CI/CD

Guia rápido para fazer o CI/CD funcionar em 5 minutos.

## ⚡ Passo a Passo Rápido

### 1. Configurar Secrets no GitHub (2 min)

Acesse: `https://github.com/seu-usuario/ekklesia/settings/secrets/actions`

Adicione estes secrets (clique em "New repository secret" para cada um):

| Secret | Valor | Exemplo |
|--------|-------|---------|
| `VPS_SSH_PRIVATE_KEY` | Chave privada SSH | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `VPS_HOST` | IP da VPS | `72.61.42.147` |
| `VPS_USER` | Usuário SSH | `root` |
| `VPS_DEPLOY_PATH` | Caminho da app | `/root/ekklesia` |
| `DATABASE_URL` | URL do banco | `mysql://root:senha@localhost:3306/ekklesia` |
| `JWT_SECRET` | Chave JWT | `openssl rand -hex 32` |
| `NEXTAUTH_SECRET` | Chave NextAuth | `openssl rand -hex 32` |
| `ENCRYPTION_KEY` | Chave criptografia | `openssl rand -hex 32` |
| `APP_URL` | URL pública | `https://seu-dominio.com` |
| `NEXTAUTH_URL` | URL NextAuth | `https://seu-dominio.com` |

### 2. Verificar SSH na VPS (1 min)

```bash
# No seu Mac, testar conexão
ssh -i ~/.ssh/github-actions-deploy root@72.61.42.147

# Se funcionar sem pedir senha, está OK ✅
```

### 3. Verificar VPS (1 min)

Na VPS, execute:

```bash
# Verificar Node.js
node --version  # Deve ser 18+

# Verificar PM2
pm2 --version

# Verificar MySQL
systemctl status mysql
```

### 4. Testar CI/CD (1 min)

```bash
# Fazer commit e push
git add .
git commit -m "test: verificar CI/CD"
git push origin main
```

### 5. Verificar Resultado

1. Acesse: `https://github.com/seu-usuario/ekklesia/actions`
2. Veja o workflow executando
3. Aguarde conclusão
4. Verifique se passou ✅

## ✅ Pronto!

Se tudo passou, o CI/CD está funcionando!

## 🐛 Problemas?

### CI falha
- Verifique logs em Actions
- Execute `npm run lint` e `npm run build` localmente

### Deploy falha
- Verifique se todos os secrets estão configurados
- Verifique conexão SSH
- Verifique logs em Actions

## 📚 Documentação Completa

- [CICD.md](CICD.md) - Guia completo
- [SECRETS.example.md](SECRETS.example.md) - Lista de secrets
- [VERIFICAR_CICD.md](VERIFICAR_CICD.md) - Checklist completo

---

**Tempo estimado:** 5 minutos

