# 🔧 Solução - Cache do Prisma Client

## 🔴 Problema

O arquivo `.env` está correto com MySQL:
```env
DATABASE_URL="mysql://root:123456@localhost:3306/ekklesia"
```

Mas o erro persiste:
```
Can't reach database server at `localhost:3306`
```

## ✅ Causa

O **Prisma Client** foi gerado com uma configuração antiga (SQLite) e está em cache. Mesmo com o `.env` correto, o Prisma Client precisa ser regenerado.

## 🚀 Solução

### 1. Limpar cache do Prisma

```bash
# Remover node_modules/.prisma (cache do Prisma)
rm -rf node_modules/.prisma

# Ou no Windows PowerShell:
Remove-Item -Recurse -Force node_modules\.prisma -ErrorAction SilentlyContinue
```

### 2. Regenerar Prisma Client

```bash
npm run db:generate
```

### 3. Verificar se o banco existe

Certifique-se de que o banco `ekklesia` existe:

```sql
CREATE DATABASE IF NOT EXISTS ekklesia 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

### 4. Aplicar schema

```bash
npm run db:push
```

### 5. Popular dados iniciais

```bash
npm run db:seed
```

### 6. Reiniciar servidor Next.js

**IMPORTANTE:** Pare completamente o servidor (Ctrl+C) e reinicie:

```bash
npm run dev
```

## 🔍 Por que isso acontece?

- O Prisma Client é gerado em `node_modules/.prisma`
- Ele é gerado baseado no `schema.prisma` e no `DATABASE_URL` do momento
- Se você alterou o `.env` depois de gerar o client, ele ainda usa a configuração antiga
- O Next.js também pode ter cache das variáveis de ambiente

## ✅ Checklist

- [ ] `.env` está correto (MySQL) ✅
- [ ] MySQL está rodando ✅
- [ ] Banco `ekklesia` existe
- [ ] Prisma Client regenerado (`npm run db:generate`)
- [ ] Schema aplicado (`npm run db:push`)
- [ ] Servidor Next.js reiniciado completamente

## 🆘 Se ainda não funcionar

1. **Limpar cache do Next.js:**
   ```bash
   rm -rf .next
   # Ou no Windows:
   Remove-Item -Recurse -Force .next
   ```

2. **Reinstalar dependências:**
   ```bash
   rm -rf node_modules
   npm install
   npm run db:generate
   ```

3. **Verificar se o MySQL aceita conexões:**
   - Teste a conexão manualmente
   - Verifique se a porta 3306 está aberta
   - Verifique se o usuário `root` tem permissão para conectar

