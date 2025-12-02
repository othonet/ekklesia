# ⚡ Solução Rápida - Erro de Conexão MySQL

## 🔴 Problema
```
Can't reach database server at `localhost:3306`
```

## ✅ Solução Rápida

### Passo 1: Verificar se MySQL está rodando

**Windows (PowerShell como Administrador):**
```powershell
# Verificar serviços MySQL
Get-Service | Where-Object {$_.Name -like "*mysql*"}

# Se encontrar, iniciar:
Start-Service MySQL80
# ou
Start-Service MySQL
```

**Alternativa - Verificar no Gerenciador de Serviços:**
1. Pressione `Win + R`
2. Digite `services.msc`
3. Procure por "MySQL"
4. Clique com botão direito → Iniciar

### Passo 2: Verificar configuração do `.env`

Abra o arquivo `.env` na raiz do projeto e verifique:

```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/ekklesia"
```

**Exemplos comuns:**

```env
# Se usar root sem senha
DATABASE_URL="mysql://root@localhost:3306/ekklesia"

# Se usar root com senha "123456"
DATABASE_URL="mysql://root:123456@localhost:3306/ekklesia"

# Se usar outro usuário
DATABASE_URL="mysql://seuusuario:suasenha@localhost:3306/ekklesia"
```

### Passo 3: Criar banco de dados (se não existir)

Abra o MySQL (MySQL Workbench, DBeaver, ou linha de comando):

```sql
CREATE DATABASE IF NOT EXISTS ekklesia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Ou via linha de comando:**
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS ekklesia CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Passo 4: Aplicar schema

```bash
# Gerar Prisma Client
npm run db:generate

# Aplicar schema
npm run db:push

# Popular com dados iniciais
npm run db:seed
```

### Passo 5: Reiniciar servidor

```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

---

## 🔍 Verificação Rápida

Execute este comando para testar a conexão:

```bash
# Testar conexão MySQL
mysql -u root -p -h localhost -P 3306
```

Se conectar, o MySQL está funcionando. Se não conectar, o problema é:
- MySQL não está rodando
- Senha incorreta
- Porta diferente

---

## 🆘 Se ainda não funcionar

1. **Verificar porta do MySQL:**
   - Abra o arquivo de configuração do MySQL (geralmente `my.ini` ou `my.cnf`)
   - Verifique a porta configurada
   - Atualize o `.env` se necessário

2. **Verificar se há outro processo na porta 3306:**
   ```powershell
   netstat -ano | findstr :3306
   ```

3. **Reinstalar MySQL** (último recurso):
   - Desinstale MySQL
   - Reinstale
   - Configure novamente

---

## 📝 Checklist

- [ ] MySQL está rodando?
- [ ] Arquivo `.env` existe e está configurado?
- [ ] Banco de dados `ekklesia` existe?
- [ ] Credenciais no `.env` estão corretas?
- [ ] Prisma Client foi gerado (`npm run db:generate`)?
- [ ] Schema foi aplicado (`npm run db:push`)?

---

**Após resolver, execute:**
```bash
npm run db:seed
npm run dev
```

