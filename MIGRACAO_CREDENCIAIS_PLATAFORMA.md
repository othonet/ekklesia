# 🔄 Migração - Credenciais Exclusivas da Plataforma

## 📋 Passo a Passo

### 1. Aplicar Mudanças no Schema

O campo `isPlatformAdmin` foi adicionado ao schema. Execute:

```bash
# Opção 1: Criar migração (recomendado)
npx prisma migrate dev --name add_is_platform_admin

# Opção 2: Aplicar diretamente (mais rápido para desenvolvimento)
npx prisma db push
```

### 2. Regenerar Prisma Client

```bash
npx prisma generate
```

### 3. Popular Banco com Dados Iniciais

```bash
npm run db:seed
```

Isso criará:
- ✅ Usuário da plataforma: `platform@ekklesia.com` / `platform123`
- ✅ Usuário admin da igreja: `admin@ekklesia.com` / `admin123`
- ✅ Usuário pastor: `pastor@ekklesia.com` / `pastor123`

### 4. Atualizar Usuários Existentes (Opcional)

Se você já tem usuários no banco e quer dar acesso à plataforma a algum deles:

```sql
-- Dar acesso à plataforma para um usuário específico
UPDATE users 
SET isPlatformAdmin = true 
WHERE email = 'seu-email@exemplo.com';
```

---

## ✅ Verificação

Após a migração:

1. **Teste login da plataforma:**
   - Email: `platform@ekklesia.com`
   - Senha: `platform123`
   - Deve redirecionar para `/platform`

2. **Teste login da igreja:**
   - Email: `admin@ekklesia.com`
   - Senha: `admin123`
   - Deve redirecionar para `/dashboard`
   - Não deve conseguir acessar `/platform`

---

## 🔒 Segurança

- Apenas usuários com `isPlatformAdmin = true` podem acessar a plataforma
- Mesmo sendo `role = ADMIN`, se `isPlatformAdmin = false`, não pode acessar
- Credenciais da plataforma são completamente separadas

---

**Status:** ✅ Pronto para migração

