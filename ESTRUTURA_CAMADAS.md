# 🏗️ Estrutura de Camadas do Sistema Ekklesia

O sistema está organizado em **três camadas distintas**, cada uma com seu propósito e acesso específico.

---

## 📊 Visão Geral das Camadas

```
┌─────────────────────────────────────────────────────────┐
│  1. PLATAFORMA MULTITENANCY                             │
│     Gerenciar igrejas (tenants)                          │
│     Acesso: Super Administradores (role: ADMIN)         │
│     URL: /platform                                       │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  2. ADMINISTRAÇÃO DA IGREJA (TENANT)                    │
│     Gerenciar membros, finanças, ministérios, etc.      │
│     Acesso: Admin/Pastor/Leader da igreja               │
│     URL: /dashboard                                     │
│     Módulos baseados no plano da igreja                │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  3. MEMBROS (APP MOBILE)                                 │
│     Acessar informações da igreja                      │
│     Acesso: Membros da igreja                           │
│     Plataforma: App Mobile Flutter                       │
│     APIs: /api/members/me/*                             │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Camada 1: Plataforma Multitenancy

### Propósito
Gerenciar todas as igrejas (tenants) do sistema, configurar planos e módulos.

### Acesso
- **Role:** `ADMIN` (Super Administrador)
- **URL Base:** `/platform`
- **Autenticação:** Login como super admin

### Funcionalidades
- ✅ Dashboard com estatísticas do sistema
- ✅ Gerenciar tenants (criar, editar, visualizar)
- ✅ Atribuir planos às igrejas
- ✅ Gerenciar planos e módulos
- ✅ Visualizar estatísticas globais

### Rotas
- `/platform` - Dashboard da plataforma
- `/platform/tenants` - Lista de tenants
- `/platform/tenants/new` - Criar novo tenant
- `/platform/plans` - Gerenciar planos

### APIs
- `/api/platform/stats` - Estatísticas da plataforma
- `/api/platform/tenants` - Gerenciar tenants
- `/api/platform/plans` - Gerenciar planos
- `/api/platform/modules` - Gerenciar módulos

---

## 🏢 Camada 2: Administração da Igreja (Tenant)

### Propósito
Cada igreja gerencia seus próprios dados: membros, finanças, ministérios, eventos, etc.

### Acesso
- **Roles:** `ADMIN`, `PASTOR`, `LEADER` (da igreja)
- **URL Base:** `/dashboard`
- **Autenticação:** Login como admin/pastor/leader da igreja
- **Módulos:** Baseados no plano atribuído à igreja

### Funcionalidades
Baseadas nos módulos do plano da igreja:

#### Plano Básico
- ✅ Gerenciar Membros (CRUD básico)
- ✅ Gerenciar Finanças (Dízimos e ofertas)

#### Plano Intermediário
- ✅ Tudo do Básico +
- ✅ Gerenciar Ministérios
- ✅ Gerenciar Patrimônio

#### Plano Master
- ✅ Todos os módulos disponíveis
- ✅ App Mobile para membros

### Rotas
- `/dashboard` - Dashboard da igreja
- `/dashboard/members` - Gerenciar membros
- `/dashboard/finances` - Gerenciar finanças
- `/dashboard/ministries` - Gerenciar ministérios
- `/dashboard/assets` - Gerenciar patrimônio
- ... (outras rotas baseadas nos módulos)

### APIs
- `/api/members` - Gerenciar membros
- `/api/finances` - Gerenciar finanças
- `/api/ministries` - Gerenciar ministérios
- `/api/assets` - Gerenciar patrimônio
- ... (outras APIs baseadas nos módulos)

### Sidebar
O sidebar mostra apenas os módulos permitidos pelo plano da igreja.

---

## 📱 Camada 3: Membros (App Mobile)

### Propósito
Membros da igreja acessam informações através do aplicativo mobile.

### Acesso
- **Tipo:** Membros da igreja
- **Plataforma:** App Mobile Flutter
- **Autenticação:** Login como membro (email/senha)
- **Requisito:** Igreja deve ter plano Master (módulo MOBILE_APP)

### Funcionalidades
- ✅ Visualizar perfil pessoal
- ✅ Ver certificados
- ✅ Ver cursos
- ✅ Ver ministérios
- ✅ Ver doações
- ✅ Ver eventos
- ✅ Ver escalas de ministério
- ✅ Acessar privacidade (LGPD)

### APIs
- `/api/auth/member/login` - Login de membro
- `/api/members/me` - Dados do membro
- `/api/members/me/certificates` - Certificados
- `/api/members/me/courses` - Cursos
- `/api/members/me/ministries` - Ministérios
- `/api/members/me/donations` - Doações
- `/api/members/me/events` - Eventos
- `/api/members/me/schedules` - Escalas

### Verificação de Acesso
O login de membros verifica se a igreja tem o módulo `MOBILE_APP` ativo.

---

## 🔐 Controle de Acesso

### Plataforma Multitenancy
```typescript
// Verificar se é super admin
import { isPlatformAdmin } from '@/lib/platform-auth'

if (!(await isPlatformAdmin(request))) {
  return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
}
```

### Administração da Igreja
```typescript
// Verificar se é admin/pastor/leader da igreja
import { isChurchAdmin } from '@/lib/platform-auth'

if (!(await isChurchAdmin(request))) {
  return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
}
```

### Membros (App Mobile)
```typescript
// Verificar se a igreja tem acesso ao app
import { hasMobileAppAccess } from '@/lib/module-permissions'

if (!(await hasMobileAppAccess(churchId))) {
  return NextResponse.json({ error: 'App não disponível' }, { status: 403 })
}
```

---

## 📁 Estrutura de Arquivos

```
app/
├── platform/              # Camada 1: Plataforma Multitenancy
│   ├── page.tsx           # Dashboard da plataforma
│   ├── tenants/           # Gerenciar tenants
│   └── plans/             # Gerenciar planos
│
├── dashboard/             # Camada 2: Administração da Igreja
│   ├── page.tsx           # Dashboard da igreja
│   ├── members/           # Gerenciar membros
│   ├── finances/          # Gerenciar finanças
│   ├── ministries/        # Gerenciar ministérios
│   └── ...                # Outros módulos
│
└── api/
    ├── platform/          # APIs da plataforma
    ├── members/           # APIs de membros (igreja)
    ├── members/me/        # APIs de membros (app mobile)
    └── auth/              # Autenticação
```

---

## 🎨 Navegação (Sidebar)

### Para Super Admin
```
┌─────────────────────────┐
│ Administração do Sistema │
│ • Painel Plataforma     │ ← /platform
└─────────────────────────┘
┌─────────────────────────┐
│ Módulos da Igreja        │
│ • Dashboard              │ ← /dashboard
│ • Membros                │ ← Baseado no plano
│ • Finanças               │ ← Baseado no plano
│ • ...                    │
└─────────────────────────┘
```

### Para Admin/Pastor da Igreja
```
┌─────────────────────────┐
│ Módulos                  │
│ • Dashboard              │ ← /dashboard
│ • Membros                │ ← Baseado no plano
│ • Finanças               │ ← Baseado no plano
│ • ...                    │
└─────────────────────────┘
```

---

## 🔄 Fluxo de Acesso

### Super Admin
```
1. Login como admin@ekklesia.com
   ↓
2. Ver "Painel Plataforma" no sidebar
   ↓
3. Acessar /platform
   ↓
4. Gerenciar tenants, planos, módulos
```

### Admin/Pastor da Igreja
```
1. Login como admin/pastor da igreja
   ↓
2. Ver módulos no sidebar (baseado no plano)
   ↓
3. Acessar /dashboard
   ↓
4. Gerenciar membros, finanças, etc.
```

### Membro (App Mobile)
```
1. Abrir app mobile
   ↓
2. Login como membro
   ↓
3. Verificar se igreja tem plano Master
   ↓
4. Acessar informações pessoais
```

---

## ✅ Resumo

| Camada | URL | Acesso | Propósito |
|--------|-----|--------|-----------|
| **Plataforma** | `/platform` | Super Admin | Gerenciar tenants |
| **Igreja** | `/dashboard` | Admin/Pastor | Gerenciar dados da igreja |
| **Membros** | App Mobile | Membros | Acessar informações pessoais |

---

## 🚀 Próximos Passos

1. ✅ Estrutura de camadas criada
2. ⏳ Mover arquivos para `/platform`
3. ⏳ Atualizar APIs para usar `/api/platform`
4. ⏳ Atualizar sidebar para separar camadas
5. ⏳ Atualizar middleware para proteger rotas

