# 🏢 Sistema Multitenancy - Ekklesia

Sistema de gerenciamento de planos e módulos para controle de funcionalidades por igreja.

## 📋 Visão Geral

O sistema multitenancy permite gerenciar quais funcionalidades cada igreja tem acesso através de planos pré-configurados:

- **Plano Básico**: Membros + Finanças
- **Plano Intermediário**: Membros + Finanças + Ministérios + Patrimônio
- **Plano Master**: Todas as funcionalidades + App Mobile

## 🗄️ Estrutura de Dados

### Modelos Criados

1. **Module** - Módulos/Features do sistema
   - `key`: Chave única (ex: "MEMBERS", "FINANCES")
   - `name`: Nome do módulo
   - `route`: Rota do módulo
   - `icon`: Ícone (lucide-react)
   - `order`: Ordem de exibição

2. **Plan** - Planos disponíveis
   - `key`: Chave única (ex: "BASIC", "INTERMEDIATE", "MASTER")
   - `name`: Nome do plano
   - `description`: Descrição
   - `price`: Preço (opcional)

3. **PlanModule** - Relação many-to-many entre Plan e Module

4. **Church** - Atualizado com:
   - `planId`: ID do plano atribuído
   - `planAssignedAt`: Data de atribuição
   - `planExpiresAt`: Data de expiração (opcional)

## 🚀 Como Usar

### 1. Executar Migração

```bash
# Gerar Prisma Client
npm run db:generate

# Aplicar migração
npm run db:push

# Executar seed (cria módulos e planos padrão)
npm run db:seed
```

### 2. Acessar Interface Administrativa

Acesse como administrador:
- **URL**: `/dashboard/admin/churches`
- **Função**: Atribuir planos às igrejas

### 3. Atribuir Plano a uma Igreja

1. Acesse `/dashboard/admin/churches`
2. Clique em "Editar Plano" na igreja desejada
3. Selecione o plano
4. (Opcional) Defina data de expiração
5. Salve

## 📦 Módulos Disponíveis

| Módulo | Chave | Descrição |
|--------|-------|-----------|
| Membros | `MEMBERS` | Gerenciamento de membros (CRUD básico) |
| Finanças | `FINANCES` | Gerenciamento de finanças (Dízimos e ofertas) |
| Ministérios | `MINISTRIES` | Gerenciamento de ministérios |
| Patrimônio | `ASSETS` | Gerenciamento de patrimônio |
| Eventos | `EVENTS` | Gerenciamento de eventos |
| Cursos | `COURSES` | Gerenciamento de cursos |
| Certificados | `CERTIFICATES` | Gerenciamento de certificados |
| Analytics | `ANALYTICS` | Análises e métricas |
| Relatórios Financeiros | `REPORTS` | Relatórios financeiros detalhados |
| Orçamentos | `BUDGETS` | Gerenciamento de orçamentos |
| Transparência | `TRANSPARENCY` | Portal de transparência |
| App para Membros | `MOBILE_APP` | Acesso ao aplicativo mobile |

## 💎 Planos Configurados

### Plano Básico
- ✅ Membros
- ✅ Finanças
- ❌ App Mobile

### Plano Intermediário
- ✅ Membros
- ✅ Finanças
- ✅ Ministérios
- ✅ Patrimônio
- ❌ App Mobile

### Plano Master
- ✅ Todos os módulos
- ✅ App Mobile

## 🔧 APIs Disponíveis

### Verificar Acesso a Módulo
```
GET /api/modules/check?churchId={id}&moduleKey={key}
```

### Obter Módulos da Igreja
```
GET /api/modules/church/{churchId}
```

### Gerenciar Planos (Admin)
```
GET /api/admin/plans
POST /api/admin/plans
```

### Gerenciar Módulos (Admin)
```
GET /api/admin/modules
POST /api/admin/modules
```

### Atribuir Plano a Igreja (Admin)
```
PUT /api/admin/churches/{churchId}/plan
```

## 🛠️ Utilitários

### Server-side

```typescript
import { hasModuleAccess, getChurchModules } from '@/lib/module-permissions'

// Verificar acesso
const hasAccess = await hasModuleAccess(churchId, 'MEMBERS')

// Obter módulos
const modules = await getChurchModules(churchId)
```

### Client-side

```typescript
import { useModuleAccess, useChurchModules } from '@/lib/module-permissions-client'

// Hook para verificar acesso
const { hasAccess, loading } = useModuleAccess('MEMBERS')

// Hook para obter módulos
const { modules, loading } = useChurchModules()
```

## 🔒 Verificação de Acesso

### No Sidebar
O sidebar automaticamente mostra apenas os módulos permitidos para a igreja do usuário logado.

### No App Mobile
O login de membros verifica se a igreja tem acesso ao módulo `MOBILE_APP`. Se não tiver, retorna erro 403.

### Em APIs
Você pode adicionar verificação de módulo em qualquer endpoint:

```typescript
import { hasModuleAccess } from '@/lib/module-permissions'

export async function GET(request: NextRequest) {
  const churchId = getChurchIdFromRequest(request)
  
  if (!(await hasModuleAccess(churchId, 'MEMBERS'))) {
    return NextResponse.json(
      { error: 'Módulo não disponível no seu plano' },
      { status: 403 }
    )
  }
  
  // ... resto do código
}
```

## 📝 Próximos Passos

1. ✅ Modelos de dados criados
2. ✅ APIs de gerenciamento criadas
3. ✅ Interface administrativa criada
4. ✅ Sidebar atualizado
5. ✅ Verificação no app mobile
6. ⏳ Adicionar verificação em outras APIs (opcional)
7. ⏳ Adicionar logs de auditoria para mudanças de plano
8. ⏳ Adicionar notificações quando plano expirar

## 🎯 Exemplo de Uso

### Atribuir Plano Básico a uma Igreja

1. Acesse `/dashboard/admin/churches`
2. Encontre a igreja
3. Clique em "Editar Plano"
4. Selecione "Plano Básico"
5. Salve

A igreja agora terá acesso apenas a:
- Dashboard
- Membros
- Finanças

O sidebar mostrará apenas esses módulos, e tentativas de acessar outros módulos retornarão erro 403.

## ⚠️ Importante

- Apenas usuários com role `ADMIN` podem gerenciar planos
- O plano Master inclui todos os módulos, incluindo o app mobile
- Planos podem ter data de expiração
- Quando um plano expira, a igreja perde acesso a todos os módulos

