# 🔧 Configurar DATABASE_URL para MySQL

## ❌ Problema Identificado

Seu arquivo `.env` está configurado para SQLite:
```
DATABASE_URL=file:./dev.db
```

Mas o sistema precisa de MySQL!

---

## ✅ Solução

### Opção 1: Editar manualmente o `.env`

Abra o arquivo `.env` na raiz do projeto e altere:

**De:**
```env
DATABASE_URL=file:./dev.db
```

**Para:**
```env
DATABASE_URL="mysql://root:suasenha@localhost:3306/ekklesia"
```

**Exemplos:**
```env
# Se usar root sem senha
DATABASE_URL="mysql://root@localhost:3306/ekklesia"

# Se usar root com senha "123456"
DATABASE_URL="mysql://root:123456@localhost:3306/ekklesia"

# Se usar outro usuário
DATABASE_URL="mysql://usuario:senha@localhost:3306/ekklesia"
```

### Opção 2: Usar script PowerShell

Execute:
```powershell
.\configurar-database.ps1
```

O script irá:
1. Solicitar usuário MySQL
2. Solicitar senha
3. Solicitar porta (padrão: 3306)
4. Solicitar nome do banco (padrão: ekklesia)
5. Atualizar o `.env` automaticamente

---

## 📋 Próximos Passos

Após configurar o `.env`:

### 1. Criar banco de dados (se não existir)

**Opção A - Via MySQL Workbench ou DBeaver:**
```sql
CREATE DATABASE IF NOT EXISTS ekklesia 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

**Opção B - Via linha de comando (se MySQL estiver no PATH):**
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS ekklesia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

**Opção C - Via PowerShell (encontrar MySQL):**
```powershell
# Encontrar caminho do MySQL
$mysqlPath = Get-ChildItem "C:\Program Files\MySQL" -Recurse -Filter "mysql.exe" | Select-Object -First 1
& $mysqlPath.FullName -u root -p -e "CREATE DATABASE IF NOT EXISTS ekklesia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 2. Aplicar schema

```bash
# Gerar Prisma Client
npm run db:generate

# Aplicar schema ao banco
npm run db:push

# Popular com dados iniciais (módulos, planos, usuário admin)
npm run db:seed
```

### 3. Reiniciar servidor

```bash
npm run dev
```

---

## 🔍 Verificar se funcionou

Após configurar, acesse:
- `/platform` - Dashboard da plataforma (se for super admin)
- `/dashboard` - Dashboard da igreja

Se não houver mais erros de conexão, está funcionando! ✅

---

## ⚠️ Importante

- **Senha com caracteres especiais:** Use URL encoding ou coloque entre aspas
- **Sem senha:** Use `mysql://root@localhost:3306/ekklesia`
- **Porta diferente:** Verifique qual porta o MySQL está usando e atualize

---

## 🆘 Ainda com problemas?

1. Verifique se o MySQL está rodando (já confirmado ✅)
2. Verifique se o banco `ekklesia` existe
3. Teste a conexão manualmente
4. Verifique as credenciais no `.env`

