# 🗺️ Rotas por Camada - Sistema Ekklesia

## 📋 Visão Geral

O sistema está dividido em **3 camadas** completamente separadas:

1. **🏢 Plataforma Multitenancy** - Gerenciamento da plataforma
2. **🏛️ Administração da Igreja** - Gerenciamento da igreja
3. **📱 Membros (App Mobile)** - Acesso dos membros

---

## 🏢 Camada 1: Plataforma Multitenancy

### 🔐 Autenticação
- **Cookie:** `platform_token`
- **Acesso:** Apenas usuários com `isPlatformAdmin = true`
- **Redirecionamento:** `/platform` após login

### 📄 Páginas (`/platform/*`)

| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/platform` | Dashboard da plataforma | `isPlatformAdmin = true` |
| `/platform/tenants` | Lista de tenants (igrejas) | `isPlatformAdmin = true` |
| `/platform/tenants/new` | Criar novo tenant | `isPlatformAdmin = true` |
| `/platform/tenants/[churchId]/edit` | Editar tenant | `isPlatformAdmin = true` |
| `/platform/plans` | Lista de planos | `isPlatformAdmin = true` |
| `/platform/plans/[planId]/edit` | Editar plano | `isPlatformAdmin = true` |

### 🔌 APIs (`/api/platform/*`)

| Rota | Método | Descrição | Acesso |
|------|--------|-----------|--------|
| `/api/platform/stats` | GET | Estatísticas da plataforma | `isPlatformAdmin = true` |
| `/api/platform/tenants` | GET | Listar todos os tenants | `isPlatformAdmin = true` |
| `/api/platform/tenants` | POST | Criar novo tenant | `isPlatformAdmin = true` |
| `/api/platform/tenants/[churchId]` | PUT | Atualizar tenant | `isPlatformAdmin = true` |
| `/api/platform/tenants/[churchId]` | DELETE | Deletar tenant | `isPlatformAdmin = true` |
| `/api/platform/tenants/[churchId]/plan` | PUT | Atribuir plano ao tenant | `isPlatformAdmin = true` |
| `/api/platform/tenants/[churchId]/admin` | PUT | Criar/atualizar credenciais admin | `isPlatformAdmin = true` |
| `/api/platform/plans` | GET | Listar todos os planos | `isPlatformAdmin = true` |
| `/api/platform/plans` | POST | Criar novo plano | `isPlatformAdmin = true` |
| `/api/platform/plans/[planId]` | PUT | Atualizar plano | `isPlatformAdmin = true` |
| `/api/platform/plans/[planId]` | DELETE | Deletar plano | `isPlatformAdmin = true` |
| `/api/platform/modules` | GET | Listar todos os módulos | `isPlatformAdmin = true` |
| `/api/platform/modules` | POST | Criar novo módulo | `isPlatformAdmin = true` |

---

## 🏛️ Camada 2: Administração da Igreja

### 🔐 Autenticação
- **Cookie:** `church_token`
- **Acesso:** Usuários com `role = ADMIN`, `PASTOR` ou `LEADER`
- **Redirecionamento:** `/dashboard` após login

### 📄 Páginas (`/dashboard/*`)

| Rota | Descrição | Acesso | Módulo |
|------|-----------|--------|--------|
| `/dashboard` | Dashboard da igreja | ADMIN, PASTOR, LEADER | - |
| `/dashboard/members` | Gerenciar membros | ADMIN, PASTOR, LEADER | MEMBERS |
| `/dashboard/finances` | Gerenciar finanças | ADMIN, PASTOR, LEADER | FINANCES |
| `/dashboard/ministries` | Gerenciar ministérios | ADMIN, PASTOR, LEADER | MINISTRIES |
| `/dashboard/assets` | Gerenciar patrimônio | ADMIN, PASTOR, LEADER | ASSETS |
| `/dashboard/events` | Gerenciar eventos | ADMIN, PASTOR, LEADER | EVENTS |
| `/dashboard/courses` | Gerenciar cursos | ADMIN, PASTOR, LEADER | COURSES |
| `/dashboard/certificates` | Gerenciar certificados | ADMIN, PASTOR, LEADER | CERTIFICATES |
| `/dashboard/analytics` | Analytics e métricas | ADMIN, PASTOR, LEADER | ANALYTICS |
| `/dashboard/finances/reports` | Relatórios financeiros | ADMIN, PASTOR, LEADER | REPORTS |
| `/dashboard/finances/budgets` | Orçamentos | ADMIN, PASTOR, LEADER | BUDGETS |
| `/transparency` | Portal de transparência | ADMIN, PASTOR, LEADER | TRANSPARENCY |

**Nota:** As rotas acima são exibidas no sidebar apenas se a igreja tiver o módulo correspondente no plano.

### 🔌 APIs (`/api/*` - exceto `/api/platform/*` e `/api/auth/*`)

#### Membros
- `/api/members` - GET, POST
- `/api/members/[id]` - GET, PUT, DELETE
- `/api/members/[id]/baptisms` - GET, POST
- `/api/members/[id]/baptisms/[baptismId]` - PUT, DELETE
- `/api/members/[id]/courses` - GET, POST
- `/api/members/[id]/discipleships` - GET, POST
- `/api/members/[id]/ministries` - GET, POST
- `/api/members/[id]/attendances` - GET, POST
- `/api/members/export` - GET
- `/api/members/import` - POST

#### Finanças
- `/api/finances` - GET, POST
- `/api/finances/[id]` - GET, PUT, DELETE
- `/api/donations` - GET, POST
- `/api/donations/[id]` - GET, PUT, DELETE

#### Ministérios
- `/api/ministries` - GET, POST
- `/api/ministries/[id]` - GET, PUT, DELETE

#### Eventos
- `/api/events` - GET, POST
- `/api/events/[id]` - GET, PUT, DELETE

#### Cursos
- `/api/courses` - GET, POST
- `/api/courses/[id]` - GET, PUT, DELETE

#### Certificados
- `/api/certificates` - GET, POST
- `/api/certificates/[id]` - GET, PUT, DELETE
- `/api/certificates/validate` - POST

#### Patrimônio
- `/api/assets` - GET, POST
- `/api/assets/[id]` - GET, PUT, DELETE

#### Orçamentos
- `/api/budgets` - GET, POST
- `/api/budgets/[id]` - GET, PUT, DELETE

#### Pagamentos
- `/api/payments` - GET, POST
- `/api/payments/[id]` - GET, PUT

#### Analytics
- `/api/analytics` - GET

#### Dashboard
- `/api/dashboard/stats` - GET

#### Módulos
- `/api/modules/check` - POST (verificar acesso a módulo)
- `/api/modules/church/[churchId]` - GET (módulos da igreja)

#### Transparência
- `/api/transparency` - GET

---

## 📱 Camada 3: Membros (App Mobile)

### 🔐 Autenticação
- **Token:** JWT no header `Authorization: Bearer <token>`
- **Acesso:** Membros da igreja
- **Requisito:** Igreja deve ter plano **Master** (módulo `MOBILE_APP`)

### 🔌 APIs (`/api/auth/member/*` e `/api/members/me/*`)

| Rota | Método | Descrição | Acesso |
|------|--------|-----------|--------|
| `/api/auth/member/login` | POST | Login de membro | Público (com validação) |
| `/api/members/me` | GET | Dados do membro autenticado | Membros |
| `/api/members/me/donations` | GET | Doações do membro | Membros |
| `/api/members/me/certificates` | GET | Certificados do membro | Membros |
| `/api/members/me/courses` | GET | Cursos do membro | Membros |
| `/api/members/me/attendances` | GET | Presenças do membro | Membros |
| `/api/members/me/ministries` | GET | Ministérios do membro | Membros |

### 🔌 APIs de Privacidade (`/api/privacy/*`)

| Rota | Método | Descrição | Acesso |
|------|--------|-----------|--------|
| `/api/privacy/[token]` | GET | Dados de privacidade via token | Público (com token único) |
| `/api/privacy/[token]/update` | PUT | Atualizar consentimento | Público (com token único) |
| `/api/privacy/[token]/delete` | DELETE | Solicitar exclusão | Público (com token único) |

### 📄 Páginas Públicas

| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/privacy` | Política de privacidade | Público |
| `/privacy/[token]` | Portal de privacidade do membro | Público (com token único) |
| `/validate-certificate` | Validar certificado | Público |
| `/api/certificates/validate` | API de validação | Público |

---

## 🔐 Autenticação Geral

### Páginas
- `/login` - Login (público, redireciona se já autenticado)

### APIs
- `/api/auth/login` - POST (login de usuários)
- `/api/auth/member/login` - POST (login de membros)

---

## 🛡️ Proteções por Camada

### Middleware

O middleware verifica:

1. **Rotas `/platform/*`**:
   - Verifica se existe `platform_token`
   - Redireciona para `/dashboard` se não tiver

2. **Rotas `/dashboard/*`**:
   - Verifica se existe `church_token`
   - Redireciona para `/login` se não tiver

3. **APIs `/api/platform/*`**:
   - Verifica `platform_token`
   - APIs fazem verificação adicional de `isPlatformAdmin = true`

4. **APIs `/api/*` (exceto platform e auth)**:
   - Verifica `church_token`
   - APIs fazem verificação de role (ADMIN, PASTOR, LEADER)

### Verificação nas APIs

- **Plataforma:** `isPlatformAdmin()` verifica `isPlatformAdmin = true` no banco
- **Igreja:** Verifica `role` (ADMIN, PASTOR, LEADER)
- **Membros:** Verifica token JWT e `churchId`

---

## 📊 Resumo Visual

```
┌─────────────────────────────────────────────────────────┐
│  🏢 PLATAFORMA MULTITENANCY                             │
│  Cookie: platform_token                                 │
│  Acesso: isPlatformAdmin = true                         │
│  Rotas: /platform/*, /api/platform/*                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  🏛️ ADMINISTRAÇÃO DA IGREJA                             │
│  Cookie: church_token                                    │
│  Acesso: role = ADMIN, PASTOR, LEADER                   │
│  Rotas: /dashboard/*, /api/* (exceto platform)         │
│  Módulos: Baseados no plano da igreja                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  📱 MEMBROS (APP MOBILE)                                │
│  Token: JWT no header                                   │
│  Acesso: Membros da igreja                              │
│  Requisito: Plano Master (MOBILE_APP)                  │
│  Rotas: /api/auth/member/*, /api/members/me/*          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Acesso

### Plataforma → Igreja
- Usuário com `isPlatformAdmin = true` pode acessar ambas
- Logout na plataforma não afeta sessão da igreja
- Logout na igreja não afeta sessão da plataforma

### Igreja → Plataforma
- Usuário da igreja **NÃO** pode acessar plataforma
- Mesmo sendo `role = ADMIN`, precisa de `isPlatformAdmin = true`

### Membros → App Mobile
- Apenas membros de igrejas com plano Master
- Login via `/api/auth/member/login`
- Token JWT no header das requisições

---

**Status:** ✅ Documentação Completa

