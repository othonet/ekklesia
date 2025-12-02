# 🔐 Guia de Acesso à Administração

## 📋 Como Acessar o Painel Administrativo

### 1. Fazer Login como Administrador

1. **Acesse a página de login:**
   - URL: `http://localhost:3000/login` (desenvolvimento)
   - Ou a URL de produção do seu sistema

2. **Use as credenciais de administrador:**
   - **Email:** `admin@ekklesia.com`
   - **Senha:** `admin123`

3. **Após o login**, você será redirecionado para o dashboard

### 2. Acessar o Painel Administrativo

Após fazer login como administrador, você verá no **sidebar** (menu lateral) uma seção chamada **"Administração do Sistema"** com o link:

- **"Painel Admin"** - Clique aqui para acessar o painel administrativo

**URL direta:** `/dashboard/admin`

### 3. Funcionalidades Disponíveis

No painel administrativo, você terá acesso a:

#### Dashboard Administrativo (`/dashboard/admin`)
- 📊 Estatísticas do sistema
- 🏢 Total de igrejas
- 👥 Total de membros
- 💎 Planos disponíveis
- ✅ Igrejas ativas

#### Gerenciamento de Tenants (`/dashboard/admin/tenants`)
- 📋 Lista de todas as igrejas
- 🔍 Busca por nome, email ou cidade
- 👁️ Visualizar detalhes de cada igreja
- ✏️ Atribuir/editar planos
- ➕ Criar novos tenants

#### Gerenciamento de Planos (`/dashboard/admin/plans`)
- 📦 Visualizar todos os planos
- ⚙️ Configurar módulos por plano

---

## ⚠️ Se Não Tiver Usuário Admin

Se você ainda não executou o seed do banco de dados, execute:

```bash
npm run db:seed
```

Isso criará:
- ✅ Usuário administrador (`admin@ekklesia.com` / `admin123`)
- ✅ Usuário pastor (`pastor@ekklesia.com` / `pastor123`)
- ✅ Igreja exemplo
- ✅ Módulos do sistema
- ✅ Planos (Básico, Intermediário, Master)

---

## 🔒 Segurança

**IMPORTANTE:** Altere a senha do administrador após o primeiro acesso em produção!

Para alterar a senha, você pode:
1. Acessar o banco de dados diretamente
2. Ou criar uma funcionalidade de alteração de senha (recomendado)

---

## 📍 URLs do Painel Administrativo

| Funcionalidade | URL |
|----------------|-----|
| Dashboard Admin | `/dashboard/admin` |
| Gerenciar Tenants | `/dashboard/admin/tenants` |
| Novo Tenant | `/dashboard/admin/tenants/new` |
| Gerenciar Planos | `/dashboard/admin/plans` |

---

## 🎯 Fluxo de Acesso

```
1. Acesse /login
   ↓
2. Faça login com admin@ekklesia.com / admin123
   ↓
3. No sidebar, clique em "Painel Admin"
   ↓
4. Você verá o dashboard administrativo
   ↓
5. Use os cards ou menu para navegar:
   - Gerenciar Tenants
   - Gerenciar Planos
   - Novo Tenant
```

---

## ❓ Problemas Comuns

### "Acesso negado" ao tentar acessar `/dashboard/admin`
- Verifique se você está logado como usuário com role `ADMIN`
- Verifique se o token de autenticação está válido
- Faça logout e login novamente

### Não vejo o link "Painel Admin" no sidebar
- Verifique se você está logado como administrador
- Verifique se o usuário tem role `ADMIN` no banco de dados
- Limpe o cache do navegador e faça login novamente

### Credenciais não funcionam
- Execute `npm run db:seed` para criar o usuário admin
- Verifique se o banco de dados está configurado corretamente
- Verifique se a senha está correta (sem espaços)

---

## 📞 Suporte

Se tiver problemas de acesso, verifique:
1. ✅ Banco de dados está rodando
2. ✅ Seed foi executado (`npm run db:seed`)
3. ✅ Servidor está rodando (`npm run dev`)
4. ✅ Credenciais estão corretas

