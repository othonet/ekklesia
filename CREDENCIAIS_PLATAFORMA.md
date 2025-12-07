# 🔐 Credenciais Exclusivas para Plataforma

## ✅ Implementação Concluída

Agora a plataforma multitenancy possui credenciais exclusivas, separadas das credenciais de administração da igreja.

---

## 🔑 Campo `isPlatformAdmin`

Foi adicionado um novo campo no modelo `User`:

```prisma
isPlatformAdmin Boolean @default(false)
```

Este campo identifica se o usuário pode acessar a plataforma multitenancy.

---

## 👤 Usuários Criados no Seed

### 1. **Plataforma Multitenancy** (Super Admin)
- **Email:** `platform@ekklesia.com`
- **Senha:** `platform123`
- **Role:** `ADMIN`
- **isPlatformAdmin:** `true`
- **churchId:** `null` (não vinculado a uma igreja)
- **Acesso:** Apenas `/platform/*`

### 2. **Administração da Igreja** (Admin da Igreja)
- **Email:** `admin@ekklesia.com`
- **Senha:** `admin123`
- **Role:** `ADMIN`
- **isPlatformAdmin:** `false`
- **churchId:** `church-default`
- **Acesso:** Apenas `/dashboard/*`

### 3. **Pastor**
- **Email:** `pastor@ekklesia.com`
- **Senha:** `pastor123`
- **Role:** `PASTOR`
- **isPlatformAdmin:** `false`
- **Acesso:** Apenas `/dashboard/*`

---

## 🔒 Regras de Acesso

### Plataforma Multitenancy (`/platform/*`)
- ✅ Apenas usuários com `isPlatformAdmin = true`
- ❌ Mesmo sendo `role = ADMIN`, se `isPlatformAdmin = false`, não pode acessar
- ❌ Usuários da igreja não podem acessar

### Administração da Igreja (`/dashboard/*`)
- ✅ Usuários com `role = ADMIN`, `PASTOR` ou `LEADER`
- ✅ Pode ter `isPlatformAdmin = true` ou `false`
- ❌ Membros (`role = MEMBER`) não podem acessar

---

## 🔄 Como Funciona

### 1. Login

Quando um usuário faz login:

1. Sistema verifica credenciais
2. Se `isPlatformAdmin = true`:
   - Define `platform_token` e `church_token`
   - Redireciona para `/platform`
3. Se `isPlatformAdmin = false`:
   - Define apenas `church_token`
   - Redireciona para `/dashboard`

### 2. Middleware

O middleware verifica:
- Rotas `/platform/*` → verifica `isPlatformAdmin = true` no banco
- Rotas `/dashboard/*` → verifica `role` (ADMIN, PASTOR, LEADER)

### 3. APIs

- APIs `/api/platform/*` → verifica `isPlatformAdmin = true`
- APIs `/api/dashboard/*` → verifica `role`

---

## 📋 Migração do Banco

Após adicionar o campo `isPlatformAdmin`, execute:

```bash
# Gerar migração
npx prisma migrate dev --name add_is_platform_admin

# Ou aplicar diretamente
npx prisma db push

# Popular com dados iniciais
npm run db:seed
```

---

## 🎯 Comportamento Esperado

### Cenário 1: Login com credenciais da plataforma
1. Login com `platform@ekklesia.com` / `platform123`
2. Sistema verifica `isPlatformAdmin = true`
3. Define `platform_token` e `church_token`
4. Redireciona para `/platform`
5. ✅ Pode acessar `/platform/*`
6. ✅ Pode acessar `/dashboard/*` (se tiver churchId)

### Cenário 2: Login com credenciais da igreja
1. Login com `admin@ekklesia.com` / `admin123`
2. Sistema verifica `isPlatformAdmin = false`
3. Define apenas `church_token`
4. Redireciona para `/dashboard`
5. ❌ Não pode acessar `/platform/*` (sem `platform_token`)
6. ✅ Pode acessar `/dashboard/*`

### Cenário 3: Tentativa de acesso à plataforma sem permissão
1. Usuário da igreja tenta acessar `/platform`
2. Middleware verifica `isPlatformAdmin = false`
3. Redireciona para `/dashboard`
4. ❌ Acesso negado à plataforma

---

## 🔧 Criar Novo Usuário da Plataforma

Para criar um novo usuário com acesso à plataforma:

```typescript
await prisma.user.create({
  data: {
    email: 'novo-platform@ekklesia.com',
    name: 'Novo Admin Plataforma',
    password: await hashPassword('senha123'),
    role: 'ADMIN',
    active: true,
    isPlatformAdmin: true, // ← IMPORTANTE
    churchId: null, // Não vinculado a uma igreja
  },
})
```

---

## ⚠️ Importante

- **Credenciais da plataforma são exclusivas** - não podem ser usadas para acessar o dashboard da igreja (a menos que tenham churchId)
- **Credenciais da igreja não podem acessar a plataforma** - mesmo sendo ADMIN
- **Campo `isPlatformAdmin` é obrigatório** para acessar `/platform/*`
- **Após adicionar o campo, execute a migração do banco**

---

**Status:** ✅ Implementação Completa

