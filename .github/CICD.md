# 🚀 Configuração de CI/CD com GitHub Actions

Este documento explica como configurar CI/CD para o projeto Ekklesia usando GitHub Actions.

## 📋 Visão Geral

O projeto possui três workflows principais:

1. **CI (Continuous Integration)** - Executa em cada push/PR
   - Lint do código
   - Build da aplicação
   - Testes LGPD
   - Verificação de tipos TypeScript

2. **Deploy** - Executa em push para `main`/`master`
   - Deploy automático para VPS
   - Backup do banco de dados
   - Migrações automáticas
   - Reinicialização da aplicação

3. **Limpeza Automática** - Executa diariamente
   - Limpeza de dados expirados (LGPD)
   - Execução automática via cron

## 🔐 Configuração de Secrets

Para que os workflows funcionem, você precisa configurar os seguintes secrets no GitHub:

### Secrets Obrigatórios para Deploy

1. **VPS_SSH_PRIVATE_KEY**
   - Chave privada SSH para acessar a VPS
   - Gere com: `ssh-keygen -t ed25519 -C "github-actions"`
   - Adicione a chave pública na VPS: `~/.ssh/authorized_keys`

2. **VPS_HOST**
   - IP ou domínio da VPS
   - Exemplo: `192.168.1.100` ou `vps.exemplo.com`

3. **VPS_USER**
   - Usuário SSH na VPS
   - Exemplo: `root` ou `deploy`

4. **VPS_DEPLOY_PATH**
   - Caminho onde a aplicação está instalada na VPS
   - Exemplo: `/root/ekklesia` ou `/var/www/ekklesia`

5. **DATABASE_URL**
   - URL de conexão com o banco de dados
   - Formato: `mysql://user:password@host:port/database`
   - Exemplo: `mysql://ekklesia_user:senha@localhost:3306/ekklesia`

6. **JWT_SECRET**
   - Chave secreta para JWT
   - Gere com: `openssl rand -hex 32`

7. **NEXTAUTH_SECRET**
   - Chave secreta para NextAuth
   - Gere com: `openssl rand -hex 32`

8. **ENCRYPTION_KEY**
   - Chave de criptografia (32 bytes hex)
   - Gere com: `openssl rand -hex 32`

9. **APP_URL**
   - URL pública da aplicação
   - Exemplo: `https://api.ekklesia.com.br`

10. **NEXTAUTH_URL**
    - URL do NextAuth (geralmente igual a APP_URL)
    - Exemplo: `https://api.ekklesia.com.br`

11. **ALLOWED_ORIGINS** (Opcional)
    - Origens permitidas para CORS (separadas por vírgula)
    - Exemplo: `https://ekklesia.com.br,https://app.ekklesia.com.br`

### Secrets Opcionais para CI

Os secrets acima também são usados no CI, mas valores padrão são usados se não configurados (apenas para validação, não para deploy real).

## 📝 Como Configurar Secrets no GitHub

1. Acesse o repositório no GitHub
2. Vá em **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret**
4. Adicione cada secret listado acima

## 🔑 Configuração de SSH na VPS

### 1. Gerar Chave SSH

Na sua máquina local:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy
```

### 2. Adicionar Chave Pública na VPS

```bash
# Copiar chave pública para VPS
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub usuario@vps-host

# Ou manualmente:
cat ~/.ssh/github_actions_deploy.pub | ssh usuario@vps-host "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### 3. Adicionar Chave Privada como Secret

```bash
# Copiar conteúdo da chave privada
cat ~/.ssh/github_actions_deploy

# Adicionar como secret VPS_SSH_PRIVATE_KEY no GitHub
```

### 4. Testar Conexão

```bash
ssh -i ~/.ssh/github_actions_deploy usuario@vps-host
```

## 🎯 Configuração de Ambientes

O workflow de deploy suporta múltiplos ambientes:

- **production** - Deploy automático em push para `main`/`master`
- **staging** - Pode ser configurado manualmente via `workflow_dispatch`

### Configurar Ambiente Staging

1. Vá em **Settings** → **Environments**
2. Clique em **New environment**
3. Nomeie como `staging`
4. Configure os secrets específicos para staging (se necessário)

## 🔄 Fluxo de Trabalho

### CI (Automático)

1. Push ou Pull Request para `main`/`master`/`develop`
2. GitHub Actions executa:
   - ✅ Lint
   - ✅ Build
   - ✅ Testes LGPD
   - ✅ Type Check
3. Se todos passarem, o código está pronto para merge/deploy

### Deploy (Automático)

1. Push para `main`/`master`
2. GitHub Actions executa:
   - ✅ Backup do banco de dados
   - ✅ Sincronização do código
   - ✅ Instalação de dependências
   - ✅ Migrações do banco
   - ✅ Build da aplicação
   - ✅ Reinicialização com PM2
3. Aplicação atualizada na VPS

### Deploy Manual

1. Vá em **Actions** → **Deploy para VPS**
2. Clique em **Run workflow**
3. Selecione o ambiente (production/staging)
4. Clique em **Run workflow**

### Limpeza Automática

1. Executa automaticamente todos os dias às 2h UTC
2. Pode ser executado manualmente via **Actions** → **Limpeza Automática de Dados**

## 🐛 Troubleshooting

### Erro: "Permission denied (publickey)"

**Causa:** Chave SSH não configurada corretamente

**Solução:**
1. Verifique se a chave pública está em `~/.ssh/authorized_keys` na VPS
2. Verifique permissões: `chmod 600 ~/.ssh/authorized_keys`
3. Verifique se o secret `VPS_SSH_PRIVATE_KEY` está correto

### Erro: "Connection refused"

**Causa:** VPS não acessível ou firewall bloqueando

**Solução:**
1. Verifique se a VPS está online
2. Verifique firewall: `sudo ufw status`
3. Verifique se a porta SSH (22) está aberta

### Erro: "DATABASE_URL not found"

**Causa:** Secret não configurado

**Solução:**
1. Verifique se todos os secrets estão configurados
2. Verifique se os nomes dos secrets estão corretos (case-sensitive)

### Erro: "PM2 command not found"

**Causa:** PM2 não instalado na VPS

**Solução:**
```bash
# Na VPS
npm install -g pm2
```

### Deploy falha mas código está correto

**Causa:** Problemas de permissão ou dependências

**Solução:**
1. Verifique logs: `pm2 logs ekklesia`
2. Verifique se o usuário SSH tem permissões no diretório de deploy
3. Execute manualmente na VPS para ver erros detalhados

## 📊 Monitoramento

### Ver Status dos Workflows

1. Acesse **Actions** no GitHub
2. Veja o histórico de execuções
3. Clique em uma execução para ver detalhes

### Notificações

Configure notificações no GitHub:
1. **Settings** → **Notifications**
2. Configure alertas para falhas de workflows

## 🔒 Segurança

### Boas Práticas

1. ✅ Nunca commite secrets no código
2. ✅ Use secrets do GitHub para dados sensíveis
3. ✅ Rotacione chaves SSH periodicamente
4. ✅ Use diferentes chaves para diferentes ambientes
5. ✅ Limite acesso SSH na VPS (apenas IPs confiáveis)
6. ✅ Use senhas fortes para o banco de dados
7. ✅ Mantenha dependências atualizadas

### Rotação de Secrets

Para rotacionar secrets:

1. Gere novos valores
2. Atualize na VPS primeiro
3. Atualize secrets no GitHub
4. Execute deploy manual para testar

## 📚 Recursos Adicionais

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [SSH Keys Guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

## ✅ Checklist de Configuração

- [ ] Secrets configurados no GitHub
- [ ] Chave SSH configurada na VPS
- [ ] Conexão SSH testada
- [ ] PM2 instalado na VPS
- [ ] Primeiro deploy manual executado com sucesso
- [ ] CI passando em PRs
- [ ] Deploy automático funcionando
- [ ] Limpeza automática configurada

---

**Última atualização:** $(date)

