# 🚀 Guia Completo de Configuração LGPD (Produção)

> **Para desenvolvimento local, consulte:** `SETUP_LOCAL.md`

Este guia passo a passo irá ajudá-lo a configurar todas as funcionalidades LGPD no sistema Ekklesia em ambiente de produção.

---

## 📋 Pré-requisitos

- [ ] Node.js instalado (v18 ou superior)
- [ ] Banco de dados MySQL configurado
- [ ] Acesso ao servidor/ambiente de produção
- [ ] Backup do banco de dados realizado

---

## 🔧 Passo 1: Configurar Variáveis de Ambiente

### 1.1 Gerar Chave de Criptografia

Execute o comando:

```bash
npm run generate:encryption-key
```

Isso gerará uma chave segura. Copie a chave e adicione ao arquivo `.env`:

```env
ENCRYPTION_KEY=sua-chave-gerada-aqui
```

**⚠️ IMPORTANTE:**
- Mantenha esta chave em segredo
- Faça backup seguro desta chave
- Se perder, não será possível descriptografar dados antigos

### 1.2 Configurar Outras Variáveis

Copie o arquivo `.env.example` para `.env` e configure:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/ekklesia"

# JWT Secret
JWT_SECRET="your-jwt-secret-key-here"

# Encryption Key (já configurado acima)
ENCRYPTION_KEY="sua-chave-gerada"

# Application URL (para links em emails)
APP_URL="https://suaigreja.com"

# Email Configuration (escolha uma opção abaixo)
```

---

## 📧 Passo 2: Configurar Notificações por Email

Escolha **UMA** das opções abaixo:

### Opção 1: SendGrid (Recomendado)

1. Crie conta em [SendGrid](https://sendgrid.com)
2. Gere API Key
3. Adicione ao `.env`:

```env
SENDGRID_API_KEY="SG.xxxxxxxxxxxxx"
EMAIL_FROM="noreply@suaigreja.com"
```

### Opção 2: Resend

1. Crie conta em [Resend](https://resend.com)
2. Gere API Key
3. Adicione ao `.env`:

```env
RESEND_API_KEY="re_xxxxxxxxxxxxx"
EMAIL_FROM="noreply@suaigreja.com"
```

### Opção 3: AWS SES

1. Configure AWS SES
2. Adicione ao `.env`:

```env
AWS_SES_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
EMAIL_FROM="noreply@suaigreja.com"
```

### Opção 4: SMTP (Gmail, Outlook, etc.)

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-de-app"
EMAIL_FROM="noreply@suaigreja.com"
```

**Nota:** Se nenhum serviço for configurado, as notificações serão apenas logadas (modo desenvolvimento).

---

## 🗄️ Passo 3: Aplicar Migração do Banco de Dados

### 3.1 Backup do Banco

**⚠️ CRÍTICO:** Faça backup antes de continuar!

```bash
mysqldump -u usuario -p nome_do_banco > backup_antes_lgpd_$(date +%Y%m%d).sql
```

### 3.2 Aplicar Migração

```bash
npx prisma migrate dev --name add_lgpd_compliance_fields
```

Isso adicionará os campos:
- `deletedAt` (soft delete)
- `retentionUntil` (política de retenção)
- `cpfEncrypted` (flag de criptografia)
- `rgEncrypted` (flag de criptografia)

### 3.3 Migrar Dados Existentes (Opcional)

Se você já tem membros cadastrados com CPF/RG, execute:

```bash
npm run lgpd:migrate
```

Este script irá:
- Criptografar CPF e RG de membros existentes
- Marcar flags de criptografia
- Verificar dados já criptografados

---

## 🧪 Passo 4: Testar Funcionalidades

Execute os testes:

```bash
npm run lgpd:test
```

Isso testará:
- ✅ Criptografia/Descriptografia
- ✅ Anonimização
- ✅ Formato de dados

---

## ⚙️ Passo 5: Configurar Limpeza Automática

### Opção 1: Cron Job (Linux/Mac)

```bash
crontab -e
```

Adicione:

```cron
# Executar diariamente às 2h da manhã
0 2 * * * cd /caminho/do/projeto && node scripts/cleanup-expired-data.js >> /var/log/ekklesia-cleanup.log 2>&1
```

### Opção 2: Vercel Cron Jobs

Crie `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/cleanup",
    "schedule": "0 2 * * *"
  }]
}
```

E configure `CRON_SECRET` no `.env`:

```env
CRON_SECRET="seu-secret-aleatorio-aqui"
```

### Opção 3: GitHub Actions

Crie `.github/workflows/cleanup-data.yml`:

```yaml
name: Cleanup Expired Data
on:
  schedule:
    - cron: '0 2 * * *'
  workflow_dispatch:

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: node scripts/cleanup-expired-data.js
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          ENCRYPTION_KEY: ${{ secrets.ENCRYPTION_KEY }}
```

---

## ✅ Passo 6: Verificação Final

### Teste Manual 1: Criptografia

1. Cadastre um novo membro com CPF: `123.456.789-00`
2. Verifique no banco: CPF deve estar criptografado (formato: `xxx:xxx:xxx`)
3. Visualize o membro na interface: CPF deve aparecer `123.456.789-00`
4. Verifique flag `cpfEncrypted = true`

### Teste Manual 2: Soft Delete

1. Delete um membro
2. Verifique `deletedAt` preenchido no banco
3. Tente listar membros: deletado não deve aparecer
4. Verifique log de auditoria

### Teste Manual 3: Consentimento

1. Acesse `/dashboard/privacy`
2. Clique em "Confirmar Consentimento"
3. Verifique `dataConsent = true` no banco
4. Verifique log de auditoria

### Teste Manual 4: Exportação

1. Exporte seus dados
2. Verifique se CPF/RG estão no arquivo JSON
3. Verifique aviso de dados sensíveis

### Teste Manual 5: Notificações

1. Cadastre um membro por admin
2. Verifique se email foi enviado (ou logado)
3. Verifique conteúdo do email

---

## 📊 Monitoramento

### Verificar Logs de Auditoria

```sql
SELECT * FROM audit_logs 
WHERE entityType = 'MEMBER' 
ORDER BY createdAt DESC 
LIMIT 100;
```

### Verificar Membros com Consentimento Pendente

Acesse: `/dashboard/members/pending-consent`

Ou via API:

```bash
curl -H "Authorization: Bearer SEU_TOKEN" \
  http://localhost:3000/api/members/pending-consent
```

### Verificar Dados para Limpeza

```sql
-- Membros com retenção expirada
SELECT id, name, retentionUntil 
FROM members 
WHERE retentionUntil < NOW() 
AND anonymized = false;

-- Membros com soft delete expirado
SELECT id, name, deletedAt 
FROM members 
WHERE deletedAt < DATE_SUB(NOW(), INTERVAL 30 DAY)
AND anonymized = false;
```

---

## 🔍 Troubleshooting

### Erro: "ENCRYPTION_KEY não definida"

**Solução:** Adicione `ENCRYPTION_KEY` no `.env` e reinicie o servidor.

### Erro: "Campo não existe no schema"

**Solução:** Execute `npx prisma migrate dev`

### Dados antigos não criptografados

**Solução:** Execute `npm run lgpd:migrate`

### Emails não estão sendo enviados

**Verifique:**
1. Serviço de email configurado corretamente
2. Credenciais válidas
3. Domínio verificado (para SendGrid/Resend)
4. Logs do servidor para erros

### Script de limpeza não executa

**Verifique:**
1. Permissões do arquivo
2. Caminhos no cron job
3. Variáveis de ambiente disponíveis
4. Logs de erro

---

## 📞 Suporte

Em caso de problemas:

1. Verifique logs do servidor
2. Verifique logs de auditoria no banco
3. Consulte `docs/LGPD_IMPROVEMENTS.md` para detalhes técnicos
4. Consulte `README_LGPD.md` para visão geral

---

## ✅ Checklist Final

- [ ] Chave de criptografia gerada e configurada
- [ ] Variáveis de ambiente configuradas
- [ ] Backup do banco realizado
- [ ] Migração do schema aplicada
- [ ] Dados existentes migrados (se necessário)
- [ ] Testes executados com sucesso
- [ ] Notificações por email configuradas
- [ ] Script de limpeza automática configurado
- [ ] Testes manuais realizados
- [ ] Documentação lida e compreendida

---

**Última atualização:** 2024
**Status:** ✅ Pronto para produção

