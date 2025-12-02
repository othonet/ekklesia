# Guia de Migração - Implementações LGPD

## ⚠️ IMPORTANTE: Antes de Aplicar as Mudanças

### 1. Backup do Banco de Dados
```bash
# Faça backup completo antes de aplicar as mudanças
mysqldump -u usuario -p nome_do_banco > backup_antes_lgpd.sql
```

### 2. Gerar Chave de Criptografia
```bash
# Gere uma chave forte de 32+ caracteres
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Adicione ao `.env`:
```env
ENCRYPTION_KEY=sua-chave-gerada-aqui
```

### 3. Aplicar Migração do Schema
```bash
npx prisma migrate dev --name add_lgpd_compliance_fields
```

Isso adicionará os campos:
- `deletedAt` (soft delete)
- `retentionUntil` (política de retenção)
- `cpfEncrypted` (flag de criptografia)
- `rgEncrypted` (flag de criptografia)

### 4. Migrar Dados Existentes (Opcional)

Se você já tem dados no banco, pode querer criptografar CPF/RG existentes:

```bash
# Criar script de migração de dados
node scripts/migrate-encrypt-existing-data.js
```

**Nota:** Este script não foi criado automaticamente. Você precisará criar baseado nas suas necessidades.

---

## 📋 Checklist Pós-Migração

- [ ] Backup do banco realizado
- [ ] Chave de criptografia configurada no `.env`
- [ ] Migração do schema aplicada
- [ ] Testar cadastro de novo membro (verificar criptografia)
- [ ] Testar visualização de membro (verificar descriptografia)
- [ ] Testar exclusão de membro (verificar soft delete)
- [ ] Testar exportação de dados
- [ ] Testar consentimento
- [ ] Configurar script de limpeza automática

---

## 🔧 Configuração do Script de Limpeza

### Opção 1: Cron Job (Linux/Mac)
```bash
# Editar crontab
crontab -e

# Adicionar linha (executar diariamente às 2h)
0 2 * * * cd /caminho/do/projeto && node scripts/cleanup-expired-data.js >> /var/log/ekklesia-cleanup.log 2>&1
```

### Opção 2: GitHub Actions
Criar `.github/workflows/cleanup-data.yml`:
```yaml
name: Cleanup Expired Data
on:
  schedule:
    - cron: '0 2 * * *' # Diariamente às 2h UTC
  workflow_dispatch:

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: node scripts/cleanup-expired-data.js
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Opção 3: Vercel Cron Jobs
Adicionar ao `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/cleanup",
    "schedule": "0 2 * * *"
  }]
}
```

E criar `app/api/cron/cleanup/route.ts` que executa o script.

---

## 🧪 Testes Recomendados

### Teste 1: Criptografia
1. Cadastre um membro com CPF: `123.456.789-00`
2. Verifique no banco: CPF deve estar criptografado
3. Visualize o membro na interface: CPF deve aparecer `123.456.789-00`
4. Verifique flag `cpfEncrypted = true`

### Teste 2: Soft Delete
1. Delete um membro
2. Verifique `deletedAt` preenchido
3. Tente listar membros: deletado não deve aparecer
4. Verifique log de auditoria

### Teste 3: Consentimento
1. Acesse `/dashboard/privacy`
2. Clique em "Confirmar Consentimento"
3. Verifique `dataConsent = true` no banco
4. Clique em "Revogar Consentimento"
5. Verifique `dataConsent = false`

### Teste 4: Exportação
1. Exporte seus dados
2. Verifique se CPF/RG estão no arquivo
3. Verifique aviso de dados sensíveis

### Teste 5: Exclusão com Período de Graça
1. Solicite exclusão de dados
2. Verifique email de notificação (se configurado)
3. Verifique `scheduledDeletionAt` no banco
4. Cancele a exclusão
5. Verifique que `deletedAt` foi removido

---

## 🚨 Problemas Comuns

### Erro: "ENCRYPTION_KEY não definida"
**Solução:** Adicione `ENCRYPTION_KEY` no `.env`

### Erro: "Campo não existe no schema"
**Solução:** Execute `npx prisma migrate dev`

### Dados antigos não criptografados
**Solução:** Crie script de migração para criptografar dados existentes

### Script de limpeza não executa
**Solução:** Verifique permissões e caminhos no cron job

---

## 📞 Suporte

Em caso de problemas:
1. Verifique logs do servidor
2. Verifique logs de auditoria no banco
3. Consulte `docs/LGPD_IMPROVEMENTS.md` para detalhes técnicos

---

**Última atualização:** 2024

