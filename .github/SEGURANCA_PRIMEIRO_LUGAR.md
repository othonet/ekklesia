# 🔒 Segurança em Primeiro Lugar - Guia de Boas Práticas

## 🎯 Princípio Fundamental

**A segurança deve ser sempre a prioridade máxima em todas as decisões de código e arquitetura.**

---

## ✅ Checklist de Segurança Obrigatório

Antes de fazer qualquer mudança no código, verifique:

- [ ] **Autenticação e Autorização**
  - [ ] Tokens JWT são validados corretamente
  - [ ] Permissões são verificadas em todas as camadas (middleware + API)
  - [ ] Não há bypass de autenticação possível
  - [ ] Tokens expirados são rejeitados

- [ ] **Secrets e Credenciais**
  - [ ] Nenhum secret tem valor padrão inseguro
  - [ ] Variáveis de ambiente são obrigatórias em produção
  - [ ] Credenciais não estão hardcoded no código
  - [ ] Credenciais não estão na documentação pública

- [ ] **Validação de Input**
  - [ ] Todos os inputs são validados com Zod ou similar
  - [ ] Tipos são verificados antes de processar
  - [ ] Limites de tamanho são aplicados
  - [ ] Sanitização de dados do usuário

- [ ] **CORS e Headers de Segurança**
  - [ ] CORS restrito em produção (não `*`)
  - [ ] Headers de segurança configurados (CSP, HSTS, etc.)
  - [ ] Cookies com flags `secure` e `httpOnly` quando possível

- [ ] **Rate Limiting**
  - [ ] Rotas de autenticação têm rate limiting
  - [ ] APIs públicas têm proteção contra abuso
  - [ ] DDoS protection configurado

- [ ] **Logs e Monitoramento**
  - [ ] Logs não expõem informações sensíveis
  - [ ] Tentativas de acesso não autorizado são logadas
  - [ ] Stack traces não são expostos em produção

---

## 🔴 Vulnerabilidades Críticas Corrigidas

### 1. ✅ JWT_SECRET sem Valor Padrão Inseguro

**Antes:**
```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key' // ❌ INSEGURO
```

**Depois:**
```typescript
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não configurado. Configure a variável de ambiente.')
} // ✅ SEGURO
```

**Arquivos corrigidos:**
- ✅ `lib/auth.ts`
- ✅ `middleware.ts`

### 2. ✅ CORS Mais Restritivo

**Antes:**
```typescript
response.headers.set('Access-Control-Allow-Origin', '*') // ❌ INSEGURO
```

**Depois:**
```typescript
// Em produção, verificar origem permitida
if (isProduction && allowedOrigins.length > 0) {
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
} else {
  // Desenvolvimento: permitir todas (necessário para app mobile)
  response.headers.set('Access-Control-Allow-Origin', '*')
} // ✅ SEGURO
```

**Arquivo corrigido:**
- ✅ `middleware.ts`

---

## ⚠️ Vulnerabilidades Conhecidas (A Corrigir)

### 1. Tokens JWT no localStorage

**Status:** ⏳ Pendente  
**Risco:** Vulnerável a XSS  
**Solução:** Migrar para cookies `httpOnly`  
**Prioridade:** Alta

**Arquivos afetados:**
- `lib/utils-client.ts`
- `app/login/page.tsx`
- `components/dashboard-layout.tsx`

### 2. Falta de Rate Limiting

**Status:** ⏳ Pendente  
**Risco:** Vulnerável a brute force e DDoS  
**Solução:** Implementar rate limiting nas rotas de autenticação  
**Prioridade:** Alta

**Rotas afetadas:**
- `/api/auth/login`
- `/api/auth/platform/login`
- `/api/auth/member/login`

### 3. Validação de Input Insuficiente

**Status:** ⏳ Parcialmente implementado  
**Risco:** Vulnerável a injection e dados inválidos  
**Solução:** Implementar Zod em todas as rotas  
**Prioridade:** Média

---

## 🛡️ Proteções Implementadas

### ✅ Autenticação por Camada

- ✅ Separação de cookies (`platform_token` vs `church_token`)
- ✅ Verificação de `isPlatformAdmin` no middleware
- ✅ Bloqueio de acesso cruzado entre camadas
- ✅ Validação de tokens em todas as rotas protegidas

### ✅ Validação de Permissões

- ✅ Middleware verifica roles básicos
- ✅ APIs verificam permissões detalhadas
- ✅ Verificação de módulos ativos por tenant

### ✅ Logs Seguros

- ✅ Logs estruturados por camada
- ✅ Não expõem tokens ou senhas
- ✅ Timestamps para auditoria

---

## 📋 Regras de Segurança para Desenvolvimento

### 1. Nunca Faça

- ❌ **Nunca** use valores padrão para secrets
- ❌ **Nunca** commite credenciais no código
- ❌ **Nunca** exponha informações sensíveis em logs
- ❌ **Nunca** confie apenas na validação do cliente
- ❌ **Nunca** permita CORS `*` em produção
- ❌ **Nunca** retorne stack traces em produção

### 2. Sempre Faça

- ✅ **Sempre** valide inputs no backend
- ✅ **Sempre** verifique permissões em múltiplas camadas
- ✅ **Sempre** use HTTPS em produção
- ✅ **Sempre** sanitize dados do usuário
- ✅ **Sempre** use prepared statements (Prisma já faz)
- ✅ **Sempre** logue tentativas de acesso não autorizado

---

## 🔍 Revisão de Segurança

### Antes de Cada Commit

1. ✅ Verificar se não há secrets hardcoded
2. ✅ Verificar se validações estão corretas
3. ✅ Verificar se permissões estão sendo verificadas
4. ✅ Verificar se logs não expõem informações sensíveis

### Antes de Cada Deploy

1. ✅ Verificar se todas as variáveis de ambiente estão configuradas
2. ✅ Verificar se CORS está restrito em produção
3. ✅ Verificar se rate limiting está ativo
4. ✅ Verificar se headers de segurança estão configurados

---

## 🚨 Em Caso de Vulnerabilidade Encontrada

1. **Não commite** código com vulnerabilidade conhecida
2. **Corrija imediatamente** antes de fazer push
3. **Documente** a vulnerabilidade e correção
4. **Revise** código relacionado para vulnerabilidades similares

---

## 📚 Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)

---

## ✅ Status Atual

- ✅ JWT_SECRET sem valor padrão inseguro
- ✅ CORS mais restritivo em produção
- ✅ Verificação de isPlatformAdmin no middleware
- ⏳ Rate limiting (pendente)
- ⏳ Migração de tokens para httpOnly cookies (pendente)
- ⏳ Validação completa com Zod (parcial)

---

**Última atualização:** 2025-12-10
