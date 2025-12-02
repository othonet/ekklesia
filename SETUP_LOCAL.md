# 🏠 Guia de Configuração Local - LGPD

Guia específico para configurar as funcionalidades LGPD em ambiente de desenvolvimento local.

---

## 📋 Pré-requisitos

- [x] Node.js instalado (v18 ou superior)
- [x] MySQL rodando localmente
- [x] Projeto clonado e dependências instaladas

---

## 🚀 Passo 1: Instalar Dependências

```bash
npm install
```

Isso instalará todas as dependências necessárias, incluindo:
- `@sendgrid/mail`, `resend`, `aws-sdk`, `nodemailer` (para emails - opcional)
- Outras dependências do projeto

---

## 🔐 Passo 2: Gerar Chave de Criptografia

Execute:

```bash
npm run generate:encryption-key
```

Você verá algo como:
```
🔐 Chave de Criptografia Gerada:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Copie essa chave!** Você precisará dela no próximo passo.

---

## ⚙️ Passo 3: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (se ainda não existir):

```env
# Database (ajuste conforme sua configuração local)
DATABASE_URL="mysql://root:senha@localhost:3306/ekklesia"

# JWT Secret (já deve existir)
JWT_SECRET="seu-jwt-secret-aqui"

# Encryption Key (cole a chave gerada no passo anterior)
ENCRYPTION_KEY="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"

# Application URL (para links em emails - use localhost)
APP_URL="http://localhost:3000"

# Node Environment
NODE_ENV="development"
```

**Nota sobre Email:** 
- Em desenvolvimento local, as notificações serão apenas logadas no console
- Se quiser testar emails reais, configure um serviço (veja abaixo)

---

## 🗄️ Passo 4: Aplicar Migração do Banco

### 4.1 Backup (Recomendado)

Se você já tem dados no banco:

```bash
# Windows (PowerShell)
mysqldump -u root -p ekklesia > backup_antes_lgpd.sql

# Linux/Mac
mysqldump -u root -p ekklesia > backup_antes_lgpd_$(date +%Y%m%d).sql
```

### 4.2 Aplicar Migração

```bash
npx prisma migrate dev --name add_lgpd_compliance_fields
```

Isso adicionará os campos:
- `deletedAt` (soft delete)
- `retentionUntil` (política de retenção)
- `cpfEncrypted` (flag de criptografia)
- `rgEncrypted` (flag de criptografia)

### 4.3 Migrar Dados Existentes (Se necessário)

Se você já tem membros cadastrados com CPF/RG:

```bash
npm run lgpd:migrate
```

Este script irá:
- Criptografar CPF e RG de membros existentes
- Marcar flags de criptografia
- Verificar dados já criptografados

**⚠️ IMPORTANTE:** Execute apenas UMA VEZ!

---

## 🧪 Passo 5: Testar Funcionalidades

Execute os testes automatizados:

```bash
npm run lgpd:test
```

Você deve ver:
```
🧪 Testando funcionalidades LGPD...

📝 Teste 1: Criptografia e Descriptografia
   ✅ Criptografia funcionando corretamente
   Original: 123.456.789-00
   Criptografado: a1b2c3d4e5f6...
   Descriptografado: 123.456.789-00

📝 Teste 2: Anonimização
   ✅ Anonimização funcionando corretamente
   ...

✅ Todos os testes passaram!
```

---

## 🧪 Passo 6: Testes Manuais

### Teste 1: Criptografia de CPF/RG

1. Inicie o servidor:
   ```bash
   npm run dev
   ```

2. Acesse: `http://localhost:3000`

3. Faça login como admin

4. Cadastre um novo membro com CPF: `123.456.789-00`

5. Verifique no banco de dados:
   ```sql
   SELECT id, name, cpf, cpfEncrypted FROM members WHERE name = 'Nome do Membro';
   ```
   
   O CPF deve estar criptografado (formato: `xxx:xxx:xxx`) e `cpfEncrypted = 1`

6. Visualize o membro na interface - o CPF deve aparecer descriptografado: `123.456.789-00`

### Teste 2: Soft Delete

1. Delete um membro pela interface

2. Verifique no banco:
   ```sql
   SELECT id, name, deletedAt FROM members WHERE name = 'Nome do Membro';
   ```
   
   `deletedAt` deve estar preenchido

3. Tente listar membros - o deletado não deve aparecer

### Teste 3: Consentimento

1. Acesse: `http://localhost:3000/dashboard/privacy`

2. Clique em "Confirmar Consentimento"

3. Verifique no banco:
   ```sql
   SELECT id, name, dataConsent, consentDate FROM members WHERE email = 'seu-email@exemplo.com';
   ```
   
   `dataConsent = 1` e `consentDate` preenchido

4. Clique em "Revogar Consentimento"

5. Verifique que `dataConsent = 0`

### Teste 4: Exportação de Dados

1. Acesse: `http://localhost:3000/dashboard/privacy`

2. Clique em "Exportar Meus Dados"

3. Verifique o arquivo JSON baixado:
   - Deve conter CPF e RG (descriptografados)
   - Deve ter aviso sobre dados sensíveis

### Teste 5: Logs de Auditoria

1. Realize qualquer ação (criar, editar, deletar membro)

2. Verifique logs:
   ```sql
   SELECT * FROM audit_logs ORDER BY createdAt DESC LIMIT 10;
   ```
   
   Deve haver registro da ação

---

## 📧 Configuração de Email (Opcional - Para Testes)

Se quiser testar envio real de emails em desenvolvimento local:

### Opção 1: Mailtrap (Recomendado para Dev)

1. Crie conta em [Mailtrap](https://mailtrap.io) (grátis)
2. Configure SMTP no `.env`:

```env
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT=2525
SMTP_USER="seu-user-do-mailtrap"
SMTP_PASS="sua-senha-do-mailtrap"
EMAIL_FROM="noreply@ekklesia.local"
```

### Opção 2: Gmail (Para Testes)

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-de-app"  # Use "Senha de App" do Google
EMAIL_FROM="noreply@ekklesia.local"
```

**Nota:** Se não configurar, as notificações serão apenas logadas no console.

---

## 🔍 Verificações Finais

### Verificar se tudo está funcionando:

```bash
# 1. Testar funcionalidades
npm run lgpd:test

# 2. Verificar se servidor inicia
npm run dev

# 3. Verificar logs de notificações (no console)
# Quando cadastrar um membro, deve aparecer:
# 📧 Notificação (modo desenvolvimento - email não enviado): ...
```

### Verificar no Banco de Dados:

```sql
-- Verificar se campos foram adicionados
DESCRIBE members;

-- Deve mostrar: deletedAt, retentionUntil, cpfEncrypted, rgEncrypted

-- Verificar membros com CPF criptografado
SELECT id, name, cpfEncrypted, rgEncrypted FROM members WHERE cpf IS NOT NULL;

-- Verificar logs de auditoria
SELECT COUNT(*) FROM audit_logs;
```

---

## 🐛 Troubleshooting Local

### Erro: "ENCRYPTION_KEY não definida"

**Solução:** 
1. Verifique se `.env` existe
2. Verifique se `ENCRYPTION_KEY` está no `.env`
3. Reinicie o servidor (`npm run dev`)

### Erro: "Campo não existe no schema"

**Solução:** 
```bash
npx prisma migrate dev
npx prisma generate
```

### Erro: "Cannot find module '@sendgrid/mail'"

**Solução:**
```bash
npm install
```

### Dados não estão sendo criptografados

**Solução:**
1. Verifique se `ENCRYPTION_KEY` está configurada
2. Verifique se migração foi aplicada
3. Execute `npm run lgpd:migrate` para dados existentes

### Notificações não aparecem

**Solução:**
- Em desenvolvimento, notificações são apenas logadas
- Verifique o console do servidor
- Se quiser emails reais, configure SMTP (veja acima)

---

## 📝 Checklist Local

- [ ] Dependências instaladas (`npm install`)
- [ ] Chave de criptografia gerada
- [ ] Arquivo `.env` configurado
- [ ] Backup do banco realizado (se tinha dados)
- [ ] Migração aplicada (`npx prisma migrate dev`)
- [ ] Dados existentes migrados (`npm run lgpd:migrate`)
- [ ] Testes executados (`npm run lgpd:test`)
- [ ] Servidor inicia sem erros (`npm run dev`)
- [ ] Testes manuais realizados
- [ ] Logs de auditoria funcionando

---

## 🎯 Próximos Passos

Após configurar localmente:

1. **Testar todas as funcionalidades** usando os testes manuais acima
2. **Quando for fazer deploy**, consulte:
   - `SETUP_LGPD.md` - Para configuração de produção
   - `vercel.json` - Se usar Vercel
   - `.github/workflows/cleanup-data.yml` - Se usar GitHub Actions

---

## 💡 Dicas para Desenvolvimento Local

1. **Logs de Notificação:** Em desenvolvimento, todas as notificações são logadas no console. Fique de olho!

2. **Testar Criptografia:** Use o Prisma Studio para ver dados criptografados:
   ```bash
   npx prisma studio
   ```

3. **Limpeza Manual:** Para testar limpeza de dados:
   ```bash
   npm run lgpd:cleanup
   ```

4. **Reset do Banco (Cuidado!):** Se precisar resetar:
   ```bash
   npx prisma migrate reset
   ```

---

**Status:** ✅ Pronto para desenvolvimento local!

**Última atualização:** 2024

