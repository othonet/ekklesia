# 🔐 Exemplo de Configuração de Secrets

Este arquivo lista todos os secrets necessários para configurar CI/CD. Use como referência ao configurar no GitHub.

## 📋 Lista de Secrets

### Secrets para Deploy na VPS

| Secret | Descrição | Exemplo | Obrigatório |
|--------|-----------|---------|-------------|
| `VPS_SSH_PRIVATE_KEY` | Chave privada SSH para acessar a VPS | `-----BEGIN OPENSSH PRIVATE KEY-----...` | ✅ Sim |
| `VPS_HOST` | IP ou domínio da VPS | `192.168.1.100` ou `vps.exemplo.com` | ✅ Sim |
| `VPS_USER` | Usuário SSH na VPS | `root` ou `deploy` | ✅ Sim |
| `VPS_DEPLOY_PATH` | Caminho da aplicação na VPS | `/root/ekklesia` | ✅ Sim |
| `DATABASE_URL` | URL de conexão com banco | `mysql://user:pass@host:3306/db` | ✅ Sim |
| `JWT_SECRET` | Chave secreta para JWT | `abc123...` (32+ caracteres) | ✅ Sim |
| `NEXTAUTH_SECRET` | Chave secreta NextAuth | `def456...` (32+ caracteres) | ✅ Sim |
| `ENCRYPTION_KEY` | Chave de criptografia (hex) | `0123456789abcdef...` (64 chars) | ✅ Sim |
| `APP_URL` | URL pública da aplicação | `https://api.ekklesia.com.br` | ✅ Sim |
| `NEXTAUTH_URL` | URL do NextAuth | `https://api.ekklesia.com.br` | ✅ Sim |
| `ALLOWED_ORIGINS` | Origens CORS permitidas | `https://ekklesia.com.br` | ⚠️ Opcional |

### Secrets para Limpeza Automática

| Secret | Descrição | Exemplo | Obrigatório |
|--------|-----------|---------|-------------|
| `DATABASE_URL` | URL de conexão com banco | `mysql://user:pass@host:3306/db` | ✅ Sim |
| `ENCRYPTION_KEY` | Chave de criptografia (hex) | `0123456789abcdef...` (64 chars) | ✅ Sim |

## 🔑 Como Gerar Chaves

### JWT_SECRET e NEXTAUTH_SECRET

```bash
openssl rand -hex 32
```

### ENCRYPTION_KEY

```bash
openssl rand -hex 32
```

### Chave SSH

**⚠️ IMPORTANTE:** A chave privada SSH **NÃO é da VPS**. Você gera na sua máquina local!

```bash
# 1. Gerar chave SSH na sua máquina local
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# 2. Copiar chave pública para VPS (permite conexão)
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub usuario@vps-host

# 3. Testar conexão
ssh -i ~/.ssh/github_actions_deploy usuario@vps-host

# 4. Ver chave privada (para adicionar como secret no GitHub)
cat ~/.ssh/github_actions_deploy

# 5. Ver chave pública (já foi copiada para VPS no passo 2)
cat ~/.ssh/github_actions_deploy.pub
```

**📚 Guia completo:** Veja [CONFIGURAR_SSH.md](CONFIGURAR_SSH.md) para instruções detalhadas.

## 📝 Exemplo de Valores

### DATABASE_URL

```
mysql://ekklesia_user:senha_forte_aqui@localhost:3306/ekklesia
```

### APP_URL e NEXTAUTH_URL

```
https://api.ekklesia.com.br
```

### ALLOWED_ORIGINS

```
https://ekklesia.com.br,https://app.ekklesia.com.br
```

## ⚠️ Importante

- **Nunca** commite secrets no código
- Use sempre secrets do GitHub para dados sensíveis
- Rotacione chaves periodicamente
- Use diferentes chaves para diferentes ambientes
- Mantenha backups seguros das chaves

## 🔄 Como Configurar no GitHub

1. Acesse: `https://github.com/seu-usuario/ekklesia/settings/secrets/actions`
2. Clique em **New repository secret**
3. Adicione cada secret listado acima
4. Para ambientes diferentes (staging/production), configure em **Environments**

## 📚 Documentação Completa

Consulte [`.github/CICD.md`](.github/CICD.md) para instruções detalhadas.

