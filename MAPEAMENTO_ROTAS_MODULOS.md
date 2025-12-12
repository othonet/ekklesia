# 🗺️ Mapeamento Completo de Rotas para Módulos

Este documento lista todas as rotas do sistema e seus módulos correspondentes.

## 📋 Como Usar

1. **Para verificar qual módulo uma rota requer:**
   ```typescript
   import { getModuleForRoute } from '@/lib/route-module-mapping'
   const module = getModuleForRoute('/dashboard/members') // Retorna 'MEMBERS'
   ```

2. **Para listar todas as rotas de um módulo:**
   ```typescript
   import { getRoutesForModule } from '@/lib/route-module-mapping'
   const routes = getRoutesForModule('MEMBERS') // Retorna todas as rotas do módulo
   ```

3. **Para escanear rotas automaticamente:**
   ```bash
   npm run scan:routes
   ```

---

## 📦 Módulos e suas Rotas

### MEMBERS - Gerenciamento de Membros
**Descrição:** Gerenciamento de membros (CRUD básico)

| Rota | Descrição | Requer Auth |
|------|-----------|-------------|
| `/dashboard/members` | Lista de membros | ✅ |
| `/dashboard/members/[id]` | Detalhes do membro | ✅ |
| `/dashboard/members/pending-consent` | Membros pendentes de consentimento LGPD | ✅ |

**APIs relacionadas:**
- `/api/members` - GET, POST
- `/api/members/[id]` - GET, PUT, DELETE
- `/api/members/[id]/baptisms` - GET, POST
- `/api/members/[id]/courses` - GET, POST
- `/api/members/[id]/discipleships` - GET, POST
- `/api/members/[id]/ministries` - GET, POST
- `/api/members/[id]/attendances` - GET, POST
- `/api/members/export` - GET
- `/api/members/import` - POST

---

### FINANCES - Gerenciamento de Finanças
**Descrição:** Gerenciamento de finanças (Dízimos e ofertas)

| Rota | Descrição | Requer Auth |
|------|-----------|-------------|
| `/dashboard/finances` | Dashboard de finanças | ✅ |

**APIs relacionadas:**
- `/api/finances` - GET, POST
- `/api/finances/[id]` - GET, PUT, DELETE
- `/api/donations` - GET, POST
- `/api/donations/[id]` - GET, PUT, DELETE

---

### REPORTS - Relatórios Financeiros
**Descrição:** Relatórios financeiros detalhados

| Rota | Descrição | Requer Auth |
|------|-----------|-------------|
| `/dashboard/finances/reports` | Relatórios financeiros | ✅ |

---

### BUDGETS - Orçamentos
**Descrição:** Gerenciamento de orçamentos

| Rota | Descrição | Requer Auth |
|------|-----------|-------------|
| `/dashboard/finances/budgets` | Orçamentos | ✅ |

**APIs relacionadas:**
- `/api/budgets` - GET, POST
- `/api/budgets/[id]` - GET, PUT, DELETE

---

### MINISTRIES - Gerenciamento de Ministérios
**Descrição:** Gerenciamento de ministérios

| Rota | Descrição | Requer Auth |
|------|-----------|-------------|
| `/dashboard/ministries` | Lista de ministérios | ✅ |
| `/dashboard/ministries/[id]/schedules` | Agendamentos do ministério | ✅ |

**APIs relacionadas:**
- `/api/ministries` - GET, POST
- `/api/ministries/[id]` - GET, PUT, DELETE

---

### ASSETS - Gerenciamento de Patrimônio
**Descrição:** Gerenciamento de patrimônio

| Rota | Descrição | Requer Auth |
|------|-----------|-------------|
| `/dashboard/assets` | Lista de patrimônio | ✅ |
| `/dashboard/assets/[id]` | Detalhes do patrimônio | ✅ |

**APIs relacionadas:**
- `/api/assets` - GET, POST
- `/api/assets/[id]` - GET, PUT, DELETE

---

### EVENTS - Gerenciamento de Eventos
**Descrição:** Gerenciamento de eventos

| Rota | Descrição | Requer Auth |
|------|-----------|-------------|
| `/dashboard/events` | Lista de eventos | ✅ |
| `/dashboard/events/[id]/attendances` | Presenças do evento | ✅ |

**APIs relacionadas:**
- `/api/events` - GET, POST
- `/api/events/[id]` - GET, PUT, DELETE

---

### COURSES - Gerenciamento de Cursos
**Descrição:** Gerenciamento de cursos

| Rota | Descrição | Requer Auth |
|------|-----------|-------------|
| `/dashboard/courses` | Lista de cursos | ✅ |

**APIs relacionadas:**
- `/api/courses` - GET, POST
- `/api/courses/[id]` - GET, PUT, DELETE

---

### CERTIFICATES - Gerenciamento de Certificados
**Descrição:** Gerenciamento de certificados

| Rota | Descrição | Requer Auth |
|------|-----------|-------------|
| `/dashboard/certificates` | Lista de certificados | ✅ |
| `/dashboard/certificates/[id]/validation-image` | Imagem de validação | ✅ |

**APIs relacionadas:**
- `/api/certificates` - GET, POST
- `/api/certificates/[id]` - GET, PUT, DELETE
- `/api/certificates/validate` - POST

---

### ANALYTICS - Analytics e Métricas
**Descrição:** Análises e métricas do sistema

| Rota | Descrição | Requer Auth |
|------|-----------|-------------|
| `/dashboard/analytics` | Dashboard de analytics | ✅ |

**APIs relacionadas:**
- `/api/analytics` - GET
- `/api/dashboard/stats` - GET

---

### TRANSPARENCY - Portal de Transparência
**Descrição:** Portal de transparência

| Rota | Descrição | Requer Auth |
|------|-----------|-------------|
| `/transparency` | Portal de transparência | ❌ (Público) |

**APIs relacionadas:**
- `/api/transparency` - GET

---

### PASTORAL - Acompanhamento Pastoral
**Descrição:** Acompanhamento Pastoral

| Rota | Descrição | Requer Auth |
|------|-----------|-------------|
| `/dashboard/pastoral` | Dashboard pastoral | ✅ |
| `/dashboard/pastoral/visits` | Visitas pastorais | ✅ |

---

## 🔧 Rotas Sem Módulo Específico

Estas rotas estão sempre disponíveis (não requerem módulo):

| Rota | Descrição | Requer Auth |
|------|-----------|-------------|
| `/dashboard` | Dashboard principal | ✅ |
| `/dashboard/leadership` | Área de liderança (para líderes de ministérios) | ✅ |

---

## 📝 Como Adicionar uma Nova Rota

1. **Adicione a rota no arquivo `lib/route-module-mapping.ts`:**
   ```typescript
   '/dashboard/nova-rota': {
     module: 'NOVO_MODULO',
     description: 'Descrição da rota',
     requiresAuth: true,
   },
   ```

2. **Atualize o `moduleNavigationMap` no `components/sidebar.tsx`** se for uma rota principal

3. **Execute o script de escaneamento:**
   ```bash
   npm run scan:routes
   ```

4. **Atualize este documento** com a nova rota

---

## 🔍 Verificação Automática

O sistema verifica automaticamente se uma rota requer um módulo através da função `getModuleForRoute()`. Isso é usado no middleware e no sidebar para controlar o acesso.

---

**Última atualização:** Gerado automaticamente pelo script `scan-routes.ts`
