# Melhorias Necessárias para Adequação Completa à LGPD

## 📋 Resumo Executivo

Este documento lista todas as melhorias necessárias para garantir conformidade total com a Lei Geral de Proteção de Dados (LGPD) no sistema Ekklesia.

---

## 🔴 CRÍTICO - Implementar Imediatamente

### 1. Criptografia de Dados Sensíveis (CPF, RG)

**Situação Atual:**
- Função de criptografia existe em `lib/encryption.ts`
- **NÃO está sendo usada** para CPF e RG
- Dados sensíveis armazenados em texto plano

**O que fazer:**
- Criptografar CPF e RG antes de salvar no banco
- Descriptografar apenas quando necessário (exibição)
- Adicionar campo `encrypted` no schema para identificar dados criptografados

**Arquivos a modificar:**
- `app/api/members/route.ts` (POST, PUT)
- `app/api/members/[id]/route.ts` (GET, PUT)
- `components/member-dialog.tsx`
- `prisma/schema.prisma` (adicionar flag de criptografia)

---

### 2. Soft Delete ao Invés de Hard Delete

**Situação Atual:**
- Exclusão de membros é permanente (`prisma.member.delete()`)
- Dados são perdidos imediatamente
- Não há período de graça para recuperação

**O que fazer:**
- Implementar soft delete (campo `deletedAt`)
- Manter dados por 30 dias antes de exclusão definitiva
- Anonimizar dados antes da exclusão permanente
- Criar job/cron para processar exclusões agendadas

**Arquivos a modificar:**
- `prisma/schema.prisma` (adicionar `deletedAt DateTime?`)
- `app/api/members/[id]/route.ts` (DELETE)
- Criar `app/api/privacy/anonymize/route.ts`
- Criar script de limpeza automática

---

### 3. Logs de Auditoria Completos

**Situação Atual:**
- Logs existem mas não estão em todas as operações
- Falta log para VIEW (visualização de dados)
- Falta log para operações financeiras sensíveis

**O que fazer:**
- Adicionar logs em TODAS as operações CRUD
- Registrar visualizações de dados pessoais
- Logar exportações e acessos
- Criar dashboard de auditoria para admins

**Arquivos a modificar:**
- `app/api/members/[id]/route.ts` (GET - adicionar log)
- `app/api/finances/route.ts` (adicionar logs)
- `app/api/donations/route.ts` (adicionar logs)
- Criar `app/dashboard/audit/page.tsx`

---

## 🟡 IMPORTANTE - Implementar em Breve

### 4. Confirmação/Revogação de Consentimento pelo Membro

**Situação Atual:**
- Membro não pode confirmar consentimento após cadastro por admin
- Não há interface para revogar consentimento
- Falta notificação quando consentimento é necessário

**O que fazer:**
- Criar endpoint `POST /api/privacy/consent` para confirmar/revogar
- Adicionar botão na página de privacidade
- Enviar email quando admin cadastra membro
- Criar relatório de membros pendentes

**Arquivos a criar/modificar:**
- `app/api/privacy/consent/route.ts` (novo)
- `app/dashboard/privacy/page.tsx` (adicionar botão)
- `app/dashboard/members/pending-consent/page.tsx` (novo - relatório)

---

### 5. Política de Retenção de Dados

**Situação Atual:**
- Não há política de retenção implementada
- Dados são mantidos indefinidamente
- Não há exclusão automática de dados antigos

**O que fazer:**
- Definir períodos de retenção por tipo de dado:
  - Membros inativos: 5 anos
  - Dados financeiros: 10 anos (obrigação legal)
  - Logs de auditoria: 2 anos
- Criar job para verificar e excluir dados expirados
- Notificar antes de excluir

**Arquivos a criar:**
- `scripts/cleanup-expired-data.js` (novo)
- Adicionar campos `retentionUntil` no schema

---

### 6. Anonimização Antes da Exclusão

**Situação Atual:**
- Função `anonymize()` existe mas não é usada
- Exclusão é direta sem anonimização
- Dados podem ser recuperados de backups

**O que fazer:**
- Anonimizar dados antes de exclusão definitiva
- Manter estrutura mas remover identificadores
- Criar processo de anonimização em lote
- Documentar processo de anonimização

**Arquivos a criar/modificar:**
- `app/api/privacy/anonymize/route.ts` (novo)
- `lib/anonymization.ts` (novo - funções de anonimização)

---

## 🟢 MELHORIAS - Implementar Quando Possível

### 7. Exportação Completa de Dados (Incluindo CPF/RG)

**Situação Atual:**
- Exportação não inclui CPF e RG
- Dados sensíveis ficam de fora da portabilidade

**O que fazer:**
- Incluir CPF/RG criptografados na exportação
- Adicionar aviso sobre dados sensíveis
- Permitir escolha: com ou sem dados sensíveis
- Adicionar senha na exportação (opcional)

**Arquivos a modificar:**
- `app/api/privacy/export/route.ts`
- `app/dashboard/privacy/page.tsx`

---

### 8. Notificações sobre Tratamento de Dados

**Situação Atual:**
- Membro não é notificado quando admin cadastra
- Falta comunicação sobre uso de dados
- Não há lembretes de consentimento

**O que fazer:**
- Enviar email quando membro é cadastrado por admin
- Notificar sobre política de privacidade
- Enviar lembretes anuais sobre consentimento
- Criar sistema de notificações in-app

**Arquivos a criar:**
- `lib/notifications.ts` (novo)
- `app/api/notifications/route.ts` (novo)

---

### 9. Relatório de Membros com Consentimento Pendente

**Situação Atual:**
- Admin não sabe quais membros precisam confirmar consentimento
- Não há visibilidade sobre status de consentimento

**O que fazer:**
- Criar página de relatório
- Listar membros com `dataConsent = false`
- Mostrar data de cadastro
- Permitir envio de notificação em massa

**Arquivos a criar:**
- `app/dashboard/members/pending-consent/page.tsx`
- `app/api/members/pending-consent/route.ts`

---

### 10. Processo de Exclusão com Período de Graça

**Situação Atual:**
- Exclusão é imediata
- Não há chance de arrependimento
- Membro não é notificado antes

**O que fazer:**
- Implementar período de graça de 30 dias
- Notificar membro antes da exclusão
- Permitir cancelamento da solicitação
- Criar interface para gerenciar exclusões pendentes

**Arquivos a modificar:**
- `app/api/privacy/delete-request/route.ts`
- `app/dashboard/privacy/page.tsx`
- Criar `app/dashboard/admin/data-deletions/page.tsx` (para admins)

---

## 📊 Checklist de Implementação

### Fase 1 - Crítico (1-2 semanas)
- [ ] Criptografia de CPF/RG
- [ ] Soft delete
- [ ] Logs completos de auditoria

### Fase 2 - Importante (2-4 semanas)
- [ ] Confirmação de consentimento
- [ ] Política de retenção
- [ ] Anonimização

### Fase 3 - Melhorias (1-2 meses)
- [ ] Exportação completa
- [ ] Notificações
- [ ] Relatórios
- [ ] Período de graça

---

## 🔐 Considerações de Segurança

1. **Chave de Criptografia:**
   - Usar variável de ambiente `ENCRYPTION_KEY`
   - Gerar chave forte (32+ caracteres)
   - Rotacionar chaves periodicamente
   - Nunca commitar chaves no código

2. **Backups:**
   - Dados criptografados devem ser descriptografados antes do backup
   - Ou usar backups criptografados
   - Testar restauração regularmente

3. **Acesso:**
   - Limitar acesso a dados sensíveis apenas para admins
   - Registrar TODOS os acessos
   - Implementar 2FA para operações sensíveis

---

## 📝 Documentação Necessária

1. **Política de Retenção de Dados** - Documentar períodos
2. **Processo de Anonimização** - Passo a passo
3. **Procedimento de Exclusão** - Fluxo completo
4. **Matriz de Responsabilidades** - Quem pode acessar o quê

---

## 🎯 Métricas de Conformidade

- % de membros com consentimento confirmado
- Tempo médio de processamento de solicitações LGPD
- Número de exclusões processadas
- Logs de auditoria por tipo de operação

---

**Última atualização:** 2024
**Responsável:** Equipe de Desenvolvimento
**Status:** Em Planejamento

