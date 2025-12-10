# 🔒 Relatório de Vulnerabilidades de Segurança

**Data:** $(date)  
**Escopo:** Análise completa do código e configurações

---

## 🔴 CRÍTICO - Corrigir Imediatamente

### 1. Chaves Secretas com Valores Padrão Inseguros

**Localização:**
- `lib/auth.ts:5` - `JWT_SECRET || 'your-secret-key'`
- `middleware.ts:7` - `JWT_SECRET || 'your-secret-key'`
- `lib/encryption.ts:21` - `ENCRYPTION_KEY || 'default-key-change-in-production'`
- `app/api/certificates/route.ts:277` - `'default-secret'` como fallback

**Risco:** Se as variáveis de ambiente não estiverem configuradas, o sistema usa chaves conhecidas e previsíveis.

**Impacto:** 
- Tokens JWT podem ser forjados
- Dados criptografados podem ser descriptografados
- Acesso não autorizado ao sistema

**Correção:**
```typescript
// ❌ ERRADO
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// ✅ CORRETO
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não configurado. Configure a variável de ambiente.')
}
```

**Arquivos a corrigir:**
- `lib/auth.ts`
- `middleware.ts`
- `lib/encryption.ts`
- `app/api/certificates/route.ts`
- `app/api/certificates/validate/route.ts`
- `app/api/certificates/[id]/update-hash/route.ts`

---

### 2. Credenciais de Banco Expostas na Documentação

**Localização:**
- `.github/RESUMO_ERROS_CORRECOES.md:29` - `DATABASE_URL="mysql://root:admin123@localhost:3306/ekklesia"`

**Risco:** Senha do banco de dados exposta publicamente no repositório.

**Impacto:**
- Acesso não autorizado ao banco de dados
- Exposição de todos os dados do sistema
- Violação de LGPD

**Correção:**
- Remover credenciais reais da documentação
- Usar placeholders: `mysql://user:***@localhost:3306/ekklesia`
- Adicionar ao `.gitignore` se necessário

---

### 3. CORS Muito Permissivo

**Localização:**
- `middleware.ts:105` - `'Access-Control-Allow-Origin', '*'`
- `next.config.js:14` - Permite `*` em desenvolvimento
- `lib/cors.ts:15` - Permite `*` em desenvolvimento

**Risco:** Permite requisições de qualquer origem, facilitando ataques CSRF.

**Impacto:**
- Ataques CSRF (Cross-Site Request Forgery)
- Acesso não autorizado de domínios maliciosos

**Correção:**
```typescript
// ❌ ERRADO
'Access-Control-Allow-Origin': '*'

// ✅ CORRETO (produção)
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || []
const origin = request.headers.get('origin')
if (allowedOrigins.includes(origin)) {
  response.headers.set('Access-Control-Allow-Origin', origin)
}
```

**Nota:** Para apps mobile, considere usar um header customizado ou token de API.

---

### 4. Tokens JWT no localStorage

**Localização:**
- `lib/utils-client.ts` - `localStorage.getItem('token')`
- `app/login/page.tsx` - Armazena token no localStorage
- `components/dashboard-layout.tsx` - Lê token do localStorage

**Risco:** Vulnerável a XSS (Cross-Site Scripting). Scripts maliciosos podem roubar tokens.

**Impacto:**
- Roubo de tokens de autenticação
- Acesso não autorizado às contas dos usuários
- Violação de dados pessoais

**Correção:**
- Migrar para cookies `httpOnly` e `secure`
- Implementar refresh tokens
- Adicionar rotação de tokens

---

### 5. Falta de Rate Limiting

**Localização:**
- Rotas de autenticação (`/api/auth/login`, `/api/auth/platform/login`, `/api/auth/member/login`)

**Risco:** Vulnerável a ataques de força bruta e DDoS.

**Impacto:**
- Tentativas ilimitadas de login
- Sobrecarga do servidor
- Comprometimento de contas

**Correção:**
```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '10 s'),
})

// Aplicar nas rotas de login
const { success } = await ratelimit.limit(identifier)
if (!success) {
  return NextResponse.json({ error: 'Muitas tentativas' }, { status: 429 })
}
```

---

### 6. Falta de Sanitização de Inputs

**Localização:**
- Todas as rotas de API que recebem dados do usuário

**Risco:** Vulnerável a XSS e injection attacks.

**Impacto:**
- Execução de scripts maliciosos
- Roubo de dados
- Defacement

**Correção:**
```typescript
import DOMPurify from 'isomorphic-dompurify'

// Sanitizar strings antes de salvar
const sanitized = DOMPurify.sanitize(userInput)
```

---

### 7. Logs com Informações Sensíveis

**Localização:**
- `lib/auth.ts:43` - `console.error('Erro ao verificar token:', error.message)`
- `middleware.ts:142` - `console.log('Middleware: Token válido...', payload.email)`
- Vários arquivos com `console.log` de dados do usuário

**Risco:** Vazamento de informações em logs de produção.

**Impacto:**
- Exposição de tokens, emails, dados pessoais
- Violação de privacidade
- Ajuda em ataques direcionados

**Correção:**
- Remover logs de produção
- Usar logger estruturado (winston, pino)
- Não logar dados sensíveis
- Implementar níveis de log

---

### 8. Falta de Headers de Segurança

**Localização:**
- `next.config.js` - Não configura headers de segurança

**Risco:** Vulnerável a vários tipos de ataques.

**Impacto:**
- Clickjacking
- XSS
- MIME type sniffing
- Injeção de conteúdo

**Correção:**
```javascript
// next.config.js
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains',
        },
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
        },
      ],
    },
  ]
}
```

---

## 🟡 IMPORTANTE - Corrigir em Breve

### 9. Validação de Input Insuficiente

**Localização:**
- Muitas rotas de API não usam Zod ou validação robusta

**Risco:** Dados inválidos ou maliciosos podem ser processados.

**Correção:**
- Implementar validação com Zod em todas as rotas
- Validar tipos, formatos, limites e constraints

---

### 10. Falta de CSRF Protection

**Localização:**
- Todas as rotas POST/PUT/DELETE

**Risco:** Vulnerável a ataques CSRF.

**Correção:**
- Implementar tokens CSRF
- Validar origem das requisições
- Usar SameSite cookies

---

### 11. Senhas Fracas no Seed

**Localização:**
- `prisma/seed.ts:173` - `'platform123'`
- `prisma/seed.ts:191` - `'admin123'`
- `prisma/seed.ts:209` - `'pastor123'`

**Risco:** Contas padrão com senhas conhecidas.

**Correção:**
- Forçar alteração de senha no primeiro login
- Gerar senhas aleatórias fortes
- Documentar claramente que são apenas para desenvolvimento

---

### 12. Exposição de Stack Traces

**Localização:**
- Vários arquivos retornam `error.stack` em desenvolvimento

**Risco:** Vazamento de informações sobre a estrutura do código.

**Correção:**
```typescript
// ❌ ERRADO
return NextResponse.json({ 
  error: error.message,
  stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
})

// ✅ CORRETO
return NextResponse.json({ 
  error: process.env.NODE_ENV === 'development' 
    ? error.message 
    : 'Erro interno do servidor'
})
```

---

## 🟢 MELHORIAS RECOMENDADAS

### 13. Implementar 2FA (Autenticação de Dois Fatores)

**Benefício:** Adiciona camada extra de segurança.

### 14. Implementar Auditoria Completa

**Benefício:** Rastreabilidade de todas as ações dos usuários.

### 15. Implementar Soft Delete

**Benefício:** Permite recuperação de dados e conformidade com LGPD.

### 16. Criptografar Dados Sensíveis (CPF, RG)

**Localização:** `docs/LGPD_IMPROVEMENTS.md` já documenta isso

**Status:** Função existe mas não está sendo usada

---

## 📋 Checklist de Correções

### Prioridade Crítica (Fazer Agora)
- [ ] Remover valores padrão inseguros de secrets
- [ ] Remover credenciais expostas da documentação
- [ ] Restringir CORS em produção
- [ ] Migrar tokens para cookies httpOnly
- [ ] Implementar rate limiting
- [ ] Adicionar sanitização de inputs
- [ ] Remover logs sensíveis
- [ ] Adicionar headers de segurança

### Prioridade Alta (Fazer em Breve)
- [ ] Implementar validação robusta com Zod
- [ ] Adicionar proteção CSRF
- [ ] Corrigir senhas fracas no seed
- [ ] Ocultar stack traces em produção

### Prioridade Média (Melhorias)
- [ ] Implementar 2FA
- [ ] Melhorar auditoria
- [ ] Implementar soft delete
- [ ] Criptografar CPF/RG

---

## 🔍 Verificação de Chaves de API

### Chaves Encontradas (Verificar se estão em .env e não commitadas)

✅ **Bom:** Não encontrei chaves de API hardcoded no código  
✅ **Bom:** `.gitignore` está configurado para ignorar `.env`  
⚠️ **Atenção:** Verificar se arquivos `.env` não foram commitados acidentalmente

### Verificação Recomendada

```bash
# Verificar se há arquivos .env no histórico do git
git log --all --full-history -- .env

# Verificar se há secrets no código
git grep -i "api.*key\|secret.*key\|password.*=" -- '*.ts' '*.tsx' '*.js'

# Verificar se há tokens expostos
git log -p -S "sk_live\|pk_live\|SG\." --all
```

---

## 📚 Recursos Adicionais

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/advanced-features/security-headers)
- [LGPD Compliance Guide](./docs/LGPD_CHECKLIST.md)

---

**Última atualização:** $(date)  
**Próxima revisão:** Recomendado revisar mensalmente ou após mudanças significativas
