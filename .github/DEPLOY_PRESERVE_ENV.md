# 🔒 Deploy Preserva Variáveis de Ambiente

## ✅ Como Funciona Agora

O workflow de deploy foi ajustado para **preservar variáveis de ambiente existentes** e fazer merge inteligente.

---

## 🔄 Estratégia de Merge

### 1. **Variáveis dos GitHub Secrets**
- ✅ Sempre atualizadas do GitHub Secrets
- ✅ Sobrescrevem valores antigos se mudarem
- ✅ Garantem consistência entre GitHub e VPS

### 2. **Variáveis Customizadas na VPS**
- ✅ **Preservadas** se não estiverem nos secrets
- ✅ Não são removidas durante o deploy
- ✅ Permitem configurações locais específicas

### 3. **Backup Automático**
- ✅ Backup criado antes de cada atualização
- ✅ Formato: `.env.production.backup.YYYYMMDD_HHMMSS`
- ✅ Permite recuperação se necessário

---

## 📋 Variáveis Gerenciadas pelos Secrets

Estas variáveis são **sempre atualizadas** do GitHub Secrets:

- `NODE_ENV`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `APP_URL`
- `ENCRYPTION_KEY`
- `ALLOWED_ORIGINS`

---

## 🔍 Exemplo de Merge

### Antes do Deploy (.env.production existente):
```env
NODE_ENV=production
DATABASE_URL=mysql://user:pass@localhost:3306/ekklesia
JWT_SECRET=old-secret
CUSTOM_VAR=valor-customizado
ANOTHER_CUSTOM=outro-valor
```

### Após o Deploy:
```env
NODE_ENV=production
DATABASE_URL=mysql://user:pass@localhost:3306/ekklesia
JWT_SECRET=new-secret-from-github
JWT_EXPIRES_IN=7d
NEXTAUTH_URL=https://enord.app
NEXTAUTH_SECRET=secret-from-github
APP_URL=https://enord.app
ENCRYPTION_KEY=key-from-github
ALLOWED_ORIGINS=https://enord.app

# Variáveis customizadas preservadas do deploy anterior
CUSTOM_VAR=valor-customizado
ANOTHER_CUSTOM=outro-valor
```

**Resultado:**
- ✅ `JWT_SECRET` atualizado do GitHub
- ✅ Variáveis dos secrets atualizadas
- ✅ `CUSTOM_VAR` e `ANOTHER_CUSTOM` preservadas

---

## 🚨 Comportamento em Casos Especiais

### Caso 1: Primeiro Deploy (sem .env.production)
- ✅ Cria `.env.production` com variáveis dos secrets
- ✅ Cria `.env` copiando de `.env.production`

### Caso 2: Deploy Subsequente (com .env.production)
- ✅ Faz backup do `.env.production` existente
- ✅ Atualiza variáveis dos secrets
- ✅ Preserva variáveis customizadas
- ✅ Sincroniza `.env` com `.env.production`

### Caso 3: Variável Removida do GitHub Secrets
- ⚠️ Se a variável existia no `.env.production`, ela será removida
- 💡 Para preservar, adicione como variável customizada diretamente na VPS

---

## 📝 Como Adicionar Variáveis Customizadas

Se você precisar de variáveis que **não estão nos GitHub Secrets**:

### Opção 1: Adicionar Diretamente na VPS
```bash
# Na VPS
cd /root/ekklesia
echo "CUSTOM_VAR=valor-customizado" >> .env.production
```

Essa variável será preservada em futuros deploys.

### Opção 2: Adicionar ao GitHub Secrets
Se quiser que seja gerenciada pelo CI/CD:
1. Adicione ao GitHub Secrets
2. Adicione ao workflow `deploy.yml` na seção de variáveis

---

## 🔍 Verificar Variáveis Preservadas

Após um deploy, verifique:

```bash
# Na VPS
cd /root/ekklesia
cat .env.production

# Ver backups criados
ls -la .env.production.backup.*
```

---

## ✅ Benefícios

1. **Segurança**: Variáveis críticas sempre atualizadas dos secrets
2. **Flexibilidade**: Variáveis customizadas preservadas
3. **Rastreabilidade**: Backups automáticos antes de cada mudança
4. **Consistência**: `.env` sempre sincronizado com `.env.production`

---

## ⚠️ Importante

- **Não remova** variáveis customizadas manualmente do `.env.production` se quiser preservá-las
- **Backups** são criados automaticamente, mas considere fazer backup manual antes de mudanças grandes
- **Variáveis dos secrets** sempre têm precedência sobre valores locais

---

**Última atualização:** 2025-12-10
