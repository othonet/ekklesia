# 🔄 Guia de Migração - Separação de Camadas

## 📋 O que precisa ser feito

Para completar a separação das três camadas, execute os seguintes passos:

### 1. Mover Arquivos

#### Plataforma Multitenancy
```bash
# Criar estrutura
mkdir -p app/platform/tenants
mkdir -p app/platform/plans

# Copiar arquivos (ou renomear)
# app/dashboard/admin/page.tsx → app/platform/page.tsx ✅
# app/dashboard/admin/tenants/page.tsx → app/platform/tenants/page.tsx
# app/dashboard/admin/tenants/new/page.tsx → app/platform/tenants/new/page.tsx
# app/dashboard/admin/plans/page.tsx → app/platform/plans/page.tsx
```

#### APIs
```bash
# Criar estrutura
mkdir -p app/api/platform/tenants
mkdir -p app/api/platform/plans
mkdir -p app/api/platform/modules

# Copiar arquivos
# app/api/admin/stats/route.ts → app/api/platform/stats/route.ts ✅
# app/api/admin/churches/route.ts → app/api/platform/tenants/route.ts
# app/api/admin/churches/[churchId]/plan/route.ts → app/api/platform/tenants/[churchId]/plan/route.ts
# app/api/admin/plans/route.ts → app/api/platform/plans/route.ts
# app/api/admin/modules/route.ts → app/api/platform/modules/route.ts
```

### 2. Atualizar Referências

#### Nas páginas da plataforma:
- `/api/admin/stats` → `/api/platform/stats`
- `/api/admin/churches` → `/api/platform/tenants`
- `/api/admin/plans` → `/api/platform/plans`
- `/api/admin/modules` → `/api/platform/modules`
- `/dashboard/admin/*` → `/platform/*`

#### No sidebar:
- Adicionar link para `/platform` (apenas para super admins)
- Separar "Plataforma" de "Administração da Igreja"

#### No middleware:
- Adicionar proteção para rotas `/platform/*` (apenas role ADMIN)

### 3. Atualizar Utilitários

Já criado:
- ✅ `lib/platform-auth.ts` - Verificações de acesso

### 4. Testar

1. Login como super admin → Acessar `/platform`
2. Login como admin da igreja → Acessar `/dashboard`
3. Login como membro no app → Verificar acesso

---

## 🎯 Estrutura Final Esperada

```
app/
├── platform/                    # Camada 1: Plataforma Multitenancy
│   ├── page.tsx                 # Dashboard
│   ├── tenants/
│   │   ├── page.tsx             # Lista de tenants
│   │   └── new/
│   │       └── page.tsx         # Criar tenant
│   └── plans/
│       └── page.tsx             # Gerenciar planos
│
├── dashboard/                   # Camada 2: Administração da Igreja
│   ├── page.tsx                 # Dashboard da igreja
│   ├── members/
│   ├── finances/
│   └── ...
│
└── api/
    ├── platform/                # APIs da Plataforma
    │   ├── stats/
    │   ├── tenants/
    │   ├── plans/
    │   └── modules/
    │
    ├── members/                 # APIs da Igreja
    ├── finances/
    └── ...
```

---

## ⚠️ Importante

- **Não deletar** os arquivos antigos até confirmar que tudo funciona
- Fazer backup antes de mover arquivos
- Testar cada camada separadamente
- Atualizar todas as referências antes de deletar arquivos antigos

