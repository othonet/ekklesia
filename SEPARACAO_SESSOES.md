# 🔐 Separação de Sessões - Plataforma e Igreja

## ✅ Implementação Concluída

As sessões da **Plataforma Multitenancy** e da **Administração da Igreja** agora estão completamente separadas.

---

## 🍪 Cookies Separados

### Antes (Problema):
- Ambas as camadas usavam o mesmo cookie `token`
- Logout em uma camada afetava a outra

### Agora (Solução):
- **Plataforma Multitenancy**: usa `platform_token`
- **Administração da Igreja**: usa `church_token`
- Logout em uma camada não afeta a outra

---

## 🔄 Como Funciona

### 1. Login

Quando um usuário faz login:

**Se for ADMIN:**
- Define **ambos** os cookies (`platform_token` e `church_token`)
- Permite navegação entre as duas camadas
- Redireciona para `/platform` por padrão

**Se for PASTOR/LEADER:**
- Define apenas `church_token`
- Redireciona para `/dashboard`

### 2. Middleware

O middleware detecta automaticamente qual cookie usar baseado na rota:

- Rotas `/platform/*` → verifica `platform_token`
- Rotas `/dashboard/*` → verifica `church_token`
- APIs `/api/platform/*` → verifica `platform_token`
- APIs `/api/dashboard/*` → verifica `church_token`

### 3. Logout

**Na Plataforma (`/platform`):**
- Remove apenas `platform_token`
- Mantém `church_token` (pode continuar acessando dashboard da igreja)

**No Dashboard da Igreja (`/dashboard`):**
- Remove apenas `church_token`
- Mantém `platform_token` (pode continuar acessando plataforma)

---

## 📁 Arquivos Modificados

### 1. `middleware.ts`
- Detecta rota e usa cookie correto
- Verifica `platform_token` para rotas da plataforma
- Verifica `church_token` para rotas do dashboard

### 2. `app/api/auth/login/route.ts`
- Define cookies separados baseado no role
- ADMIN recebe ambos os cookies
- Outros roles recebem apenas `church_token`

### 3. `components/dashboard-layout.tsx`
- Logout remove apenas `church_token`
- Mantém `platform_token` intacto

### 4. `app/platform/layout.tsx` (NOVO)
- Layout específico para plataforma
- Logout remove apenas `platform_token`
- Mantém `church_token` intacto

### 5. `lib/platform-auth.ts`
- `isPlatformAdmin()` verifica `platform_token`
- `isChurchAdmin()` verifica `church_token`

### 6. `lib/utils-client.ts`
- `getUserFromToken()` detecta contexto e usa cookie correto

---

## 🎯 Comportamento Esperado

### Cenário 1: Admin faz login
1. Login → define `platform_token` e `church_token`
2. Redireciona para `/platform`
3. Pode navegar para `/dashboard` sem fazer login novamente
4. Logout na plataforma → remove `platform_token`, mantém `church_token`
5. Ainda pode acessar `/dashboard` sem login

### Cenário 2: Admin faz logout no dashboard
1. Logout no dashboard → remove `church_token`, mantém `platform_token`
2. Ainda pode acessar `/platform` sem login

### Cenário 3: Pastor faz login
1. Login → define apenas `church_token`
2. Redireciona para `/dashboard`
3. Não pode acessar `/platform` (sem `platform_token`)

---

## ✅ Benefícios

1. **Sessões Independentes**: Logout em uma camada não afeta a outra
2. **Navegação Flexível**: Admin pode alternar entre camadas sem logout
3. **Segurança**: Cada camada tem seu próprio token
4. **Experiência do Usuário**: Não precisa fazer login múltiplas vezes

---

## 🔍 Verificação

Para testar:

1. **Login como ADMIN**
2. **Acesse `/platform`** → deve funcionar
3. **Acesse `/dashboard`** → deve funcionar
4. **Faça logout em `/platform`** → remove apenas `platform_token`
5. **Acesse `/dashboard`** → ainda deve funcionar (tem `church_token`)
6. **Faça logout em `/dashboard`** → remove apenas `church_token`
7. **Acesse `/platform`** → ainda deve funcionar (tem `platform_token`)

---

## 📝 Notas Técnicas

- Os cookies têm o mesmo valor (mesmo JWT token)
- A diferença está no **nome do cookie** usado por cada camada
- O middleware escolhe qual cookie verificar baseado na rota
- O logout remove apenas o cookie da camada atual

---

**Status:** ✅ Implementação Completa

