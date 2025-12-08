# 🔑 Guia Completo: Configuração de Chave SSH para CI/CD

Este guia explica passo a passo como gerar e configurar chaves SSH para o GitHub Actions se conectar à sua VPS.

## 📚 Entendendo Chaves SSH

### O que são?

- **Chave Privada**: Fica na sua máquina local e é usada para autenticar. **NUNCA compartilhe!**
- **Chave Pública**: É copiada para a VPS e permite que você se conecte usando a chave privada.

### Como funciona?

1. Você gera um **par de chaves** (pública + privada)
2. A **chave pública** vai para a VPS (em `~/.ssh/authorized_keys`)
3. A **chave privada** fica na sua máquina
4. Quando você (ou o GitHub Actions) tenta conectar, usa a chave privada
5. A VPS verifica se a chave pública correspondente está autorizada
6. Se sim, conexão permitida! ✅

## 🚀 Passo a Passo

### Passo 1: Gerar o Par de Chaves

Na sua **máquina local** (não na VPS), execute:

```bash
# Gerar chave SSH (recomendado: ed25519)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_ekklesia

# Ou se ed25519 não estiver disponível, use RSA:
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy" -f ~/.ssh/github_actions_ekklesia
```

**Durante a geração, você será perguntado:**
- **Passphrase**: Deixe em branco (pressione Enter) para uso automático pelo GitHub Actions
- Ou crie uma senha forte se preferir (mas precisará configurar no GitHub Actions também)

**Resultado:**
- `~/.ssh/github_actions_ekklesia` → Chave **privada** (guarde com segurança!)
- `~/.ssh/github_actions_ekklesia.pub` → Chave **pública** (vai para a VPS)

### Passo 2: Copiar Chave Pública para a VPS

#### Opção A: Usando ssh-copy-id (Mais Fácil)

```bash
# Copiar chave pública para VPS
ssh-copy-id -i ~/.ssh/github_actions_ekklesia.pub usuario@seu-vps-host

# Exemplo:
ssh-copy-id -i ~/.ssh/github_actions_ekklesia.pub root@192.168.1.100
```

#### Opção B: Manual

```bash
# 1. Ver conteúdo da chave pública
cat ~/.ssh/github_actions_ekklesia.pub

# 2. Conectar na VPS
ssh usuario@seu-vps-host

# 3. Na VPS, criar diretório .ssh se não existir
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# 4. Adicionar chave pública ao authorized_keys
echo "cole-a-chave-publica-aqui" >> ~/.ssh/authorized_keys

# 5. Ajustar permissões (IMPORTANTE!)
chmod 600 ~/.ssh/authorized_keys
```

### Passo 3: Testar Conexão

Na sua máquina local:

```bash
# Testar conexão usando a chave privada
ssh -i ~/.ssh/github_actions_ekklesia usuario@seu-vps-host

# Exemplo:
ssh -i ~/.ssh/github_actions_ekklesia root@192.168.1.100
```

**Se funcionar**, você verá o prompt da VPS sem pedir senha! ✅

### Passo 4: Obter Chave Privada para GitHub

```bash
# Mostrar conteúdo da chave privada
cat ~/.ssh/github_actions_ekklesia
```

**Copie TODO o conteúdo**, incluindo:
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
...
(muitas linhas)
...
-----END OPENSSH PRIVATE KEY-----
```

### Passo 5: Adicionar no GitHub como Secret

1. Acesse seu repositório no GitHub
2. Vá em **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret**
4. Nome: `VPS_SSH_PRIVATE_KEY`
5. Valor: Cole o conteúdo completo da chave privada
6. Clique em **Add secret**

## 📋 Checklist de Configuração

- [ ] Par de chaves gerado na máquina local
- [ ] Chave pública copiada para VPS (`~/.ssh/authorized_keys`)
- [ ] Permissões corretas na VPS (`chmod 600 ~/.ssh/authorized_keys`)
- [ ] Conexão testada manualmente (sem senha)
- [ ] Chave privada adicionada como secret no GitHub
- [ ] Outros secrets configurados (`VPS_HOST`, `VPS_USER`, etc.)

## 🔒 Segurança

### Boas Práticas

1. ✅ **Use chaves diferentes** para diferentes projetos/ambientes
2. ✅ **Nunca commite** chaves privadas no Git
3. ✅ **Use passphrase** se a chave for usada manualmente (opcional para CI/CD)
4. ✅ **Rotacione chaves** periodicamente (a cada 6-12 meses)
5. ✅ **Limite acesso SSH** na VPS (apenas IPs confiáveis)
6. ✅ **Use chaves específicas** para GitHub Actions (não reutilize suas chaves pessoais)

### Restringir Acesso SSH na VPS

Edite `/etc/ssh/sshd_config`:

```bash
# Permitir apenas autenticação por chave (sem senha)
PasswordAuthentication no
PubkeyAuthentication yes

# Limitar usuários que podem conectar
AllowUsers root deploy

# Recarregar configuração
sudo systemctl reload sshd
```

## 🐛 Troubleshooting

### Erro: "Permission denied (publickey)"

**Causa:** Chave pública não está na VPS ou permissões incorretas

**Solução:**
```bash
# Na VPS, verificar se chave está em authorized_keys
cat ~/.ssh/authorized_keys

# Verificar permissões
ls -la ~/.ssh/
# Deve mostrar:
# drwx------ .ssh
# -rw------- authorized_keys

# Corrigir permissões se necessário
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### Erro: "Host key verification failed"

**Causa:** Host não está no known_hosts

**Solução:**
```bash
# Adicionar host ao known_hosts
ssh-keyscan -H seu-vps-host >> ~/.ssh/known_hosts
```

### Erro: "Too many authentication failures"

**Causa:** Muitas chaves sendo tentadas

**Solução:**
```bash
# Especificar chave explicitamente
ssh -i ~/.ssh/github_actions_ekklesia -o IdentitiesOnly=yes usuario@vps-host
```

### GitHub Actions não consegue conectar

**Verificações:**
1. ✅ Secret `VPS_SSH_PRIVATE_KEY` está configurado corretamente?
2. ✅ Secret `VPS_HOST` está correto?
3. ✅ Secret `VPS_USER` está correto?
4. ✅ Chave pública está na VPS?
5. ✅ Permissões estão corretas na VPS?
6. ✅ Firewall permite conexão SSH (porta 22)?

**Debug:**
```bash
# Ver logs do GitHub Actions
# Acesse: https://github.com/seu-usuario/ekklesia/actions
# Clique na execução que falhou
# Veja os logs do step "Configurar SSH"
```

## 📝 Exemplo Completo

```bash
# 1. Gerar chaves
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_ekklesia

# 2. Copiar para VPS
ssh-copy-id -i ~/.ssh/github_actions_ekklesia.pub root@192.168.1.100

# 3. Testar
ssh -i ~/.ssh/github_actions_ekklesia root@192.168.1.100

# 4. Ver chave privada (para copiar no GitHub)
cat ~/.ssh/github_actions_ekklesia

# 5. Adicionar no GitHub:
# Settings → Secrets → Actions → New secret
# Nome: VPS_SSH_PRIVATE_KEY
# Valor: (cole o conteúdo do cat acima)
```

## 🔄 Rotação de Chaves

Se precisar rotacionar as chaves:

1. Gere novo par de chaves
2. Adicione nova chave pública na VPS
3. Teste conexão
4. Atualize secret no GitHub
5. Remova chave antiga da VPS (opcional, mas recomendado)

## 📚 Recursos Adicionais

- [GitHub: Using SSH](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
- [SSH Key Management](https://www.ssh.com/academy/ssh/key)
- [GitHub Actions: Using SSH](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

**Última atualização:** $(date)

